'use strict';

// requires
const
  fs = require('fs'),
  path = require('path'),
  nodeCleanup = require('node-cleanup'),
  mysql = require('mysql'),
  Exception = require('../../model/Exception').model,
  Triple = require('../../model/Triple').model,
  Analysis = require('../../model/Analysis').model,
  Resource = require('../../model/Resource').model,
  utils = require('../utils/utils'),
  murmurhashNative = require('murmurhash-native'),
  logger = require('../log')(module);

/* where to store data file */
const datadir = (() => {
  /* make sure the data directory exists */
  const datadir = path.resolve(global.__datadir && path.join(global.__datadir, 'storage') || 'storagedata');
  if (!fs.existsSync(datadir)) { fs.mkdirSync(datadir); }
  return datadir;
})();

function getFileLocation(userid, basename) {
  const userdir = path.resolve(datadir, userid.toString());
  if (!fs.existsSync(userdir)) { fs.mkdirSync(userdir); }
  return path.resolve(userdir, basename.toString());
}

const MAX_FILESIZE = process.env.MAX_FILESIZE || 5e7; // 5 MB by default

/* connection string: mysql://user:pass@host:port/database?optionkey=optionvalue&optionkey=optionvalue&... */
const connectionString = process.env.MYSQL || 'mysql://autolinks:autolinks1@mysql:3306/autolinks?debug=false&connectionLimit=100';
const pool = mysql.createPool(connectionString);
logger.info(`Using ${pool.config.connectionLimit} connections.`);

function withConnection(callback) {
  try{
    pool.getConnection(function (err, connection) {
      if (err) {
        return callback(Exception.fromError(err, 'Could not establish connection to database.'), null);
      }
      callback(null, connection);
      connection.on('error', function (err) {
        return callback(Exception.fromError(err, 'Error connecting to database.'), null);
      });
    });
  }catch(err){
    callback(Exception.fromError(err, 'Error connecting to database.'), null);
  }
}

function promisedQuery(query, values) {
  return new Promise((resolve, reject) => {
    try {
      withConnection(function (err, connection) {
        if (err) {
          return reject(err);
        }
        if (query !== Object(query)) {
          query = {
            sql: query,
            values: values,
          };
        }
        try {
          connection.query(query, function (err, rows, fields) {
            connection.release();
            if (err) {
              return reject(Exception.fromError(err, `Query failed: '${query.sql}'.`, query));
            }
            return resolve({ rows: rows, fields: fields });
          });
        } catch (e) {
          return reject(Exception.fromError(e, `Query failed: '${query.sql}'.`, query));
        }
      });
    } catch (e) {
      return reject(Exception.fromError(e, `Query failed: '${query.sql}'.`, query));
    }
  });
}

module.exports.init = function (callback, resetdata) {

  // init database read the mysql script
  fs.readFile('config/storagedb-schema.mysql.sql', 'utf8', function (err, data) {
    if (err) {
      return callback(err);
    }
    // need to load sql script manually

    // remove comments
    data = data.replace(/--.*$/gm, '');
    // remove DELEMITER LINES
    data = data.replace(/^DELIMITER.*$/gm, '');
    // remove new DELEMITERS
    data = data.replace(/\/\//gm, '');
    // // remove newlines
    // data = data.replace(/\n/gm, '');
    // split the queries
    const queries = data.split(/\n\n/g)
      .map(query => query.trim())
      .filter(query => query.length > 0);

    // resolve queries sequentially
    utils.sequentialPromise(queries, promisedQuery)
      .then(res => {
        if (resetdata) {
          return module.exports.resetDatabase().then(_ignore => res);
        }
        return res;
      })
      .then(
        res => callback(null, res),
        err => callback(err)
      );

  }); // end fs.readFile

};

module.exports.read = function (userid, storagekey, callback) {
  return this.promisedRead(userid, storagekey)
    .then(
      resource => callback(null, resource),
      err => callback(err, null)
    );
};

module.exports.promisedRead = function (userid, storagekey) {
  return this.getStorageResource(userid, storagekey);
};

module.exports.write = function (userid, storagekey, resourceList, callback) {
  return this.promisedWrite(userid, storagekey, resourceList)
    .then(
      res => callback(null, res),
      err => callback(err, null)
    );
};

module.exports.promisedWrite = function (userid, storagekey, resourceList) {
  // if storagekey is known check if a resource exists for it, otherwise save it.
  if (storagekey) {
    return this.getStorageResourceId(userid, storagekey)
      .then(rid => {
        if (rid) {
          logger.debug(`Resource for storagekey '${storagekey}' and user with id '${userid}' was already stored, skipping write action.`);
          return this.getResource(rid)
            .then(r => this.fillSourcesRecursive(userid, r));
        }
        return this.saveNewResourceOrValue(resourceList, userid)
          .then(resource => this.saveStorageItem(userid, storagekey)
            .then(sid => Object({ sid: sid, resource: resource }))
          ).then(obj => {
            this.saveStorageItemToResourceMapping(obj.sid, obj.resource.rid);
            return obj.resource;
          }).then(r => this.fillSourcesRecursive(userid, r));
      });
  }
  // if storagekey is unknown save the resource, then use the rid as storagekey
  return this.saveNewResourceOrValue(resourceList, userid)
    .then(resource => this.saveStorageItem(userid, resource.rid)
      .then(sid => Object({ sid: sid, resource: resource })))
    .then(obj => {
      this.saveStorageItemToResourceMapping(obj.sid, obj.resource.rid);
      return obj.resource;
    });
};

/**
 * work with Promises here
 * @param resource
 * @return {Promise}
 */
module.exports.saveNewResourceOrValue = function (resourceOrValue, uid, cid) {
  return new Promise((resolve, reject) => {
    let resource = null;
    if(resourceOrValue.value || resourceOrValue.rid){
      if(resource instanceof Resource){
        resource = resourceOrValue;
      }else {
        resource = new Resource().assign(resourceOrValue);
      }
    } else {
      resource = new Resource(null, resourceOrValue);
    }
    if(resource.rid){
      return resolve(resource);
    }
    resource.cid = cid;
    // a resource can be an array of resources, a triple or a string
    if (resource.isListResource()) {
      logger.debug('Resource is an array.');
      return resolve(this.saveListResource(resource, uid));
    }
    if (resource.isTripleResource()) {
      logger.debug('Resource is a triple.');
      return resolve(this.saveTripleResource(resource, uid));
    }
    if (resource.isStringResource()) {
      logger.debug('Resource is a string.');
      return resolve(this.saveStringResource(resource, uid));
    }
    reject(new Error('This is impossible, a resource has to be one of {list,triple,string}.'));
  }).then(
    resource => {
      // fill with metadata if it existed before, otherwise save metadata!
      const metadata_before = this.getMetadata(resource.rid);
      if(metadata_before && Object.keys(metadata_before).length > 0){
        return this.fillMetadata(resource);
      }
      // else
      this.updateMetadata(resource.rid, {}, resource.metadata);
      return resource;
    });
};

/**
 * work with Promises here
 * @param tripleResource
 * @return {Promise}
 */
module.exports.saveTripleResource = function (tripleResource, uid) {
  return new Promise((resolve, reject) => {
    tripleResource.value = Triple.asTriple(tripleResource.value);
    // save resources
    Promise.all([
      this.saveNewResourceOrValue(tripleResource.value.subject, uid),
      this.saveNewResourceOrValue(tripleResource.value.predicate, uid),
      this.saveNewResourceOrValue(tripleResource.value.object, uid),
    ]).then(
      resources => { // on success add triple
        tripleResource.value.subject = resources[0];
        tripleResource.value.predicate = resources[1];
        tripleResource.value.object = resources[2];
        const rids = resources.map(r => r.rid);
        logger.debug(`Saving triple ${rids} for user with id '${uid}'.`);
        return promisedQuery('select get_or_add_tripleResource(?,?,?,?) as rid', rids.concat(uid))
          .then(res => {
            tripleResource.rid = res.rows[0].rid;
            return resolve(tripleResource);
          });
      },
      err => reject(err) // on failure return the respective error
    );
  });
};

module.exports.saveListResource = function (listResource, uid) {

  const resourcePromises = listResource.value.map(resource => this.saveNewResourceOrValue(resource, uid));
  return Promise.all(resourcePromises)
    .then(
      item_resources => {
        const item_rids = item_resources.map(r => r.rid);
        logger.debug(`Saved resources ${item_rids}.`);
        const listResourceDescriptor = computeListResourceDescriptor(item_rids);
        // propagate listResourceDescriptor AND item_rids AND items
        return { desc: listResourceDescriptor, items: item_resources, item_rids: item_rids };
      }
    ).then(
      obj => {
        // check if the listresource already exists before adding elements to it!
        return promisedQuery('select * from userListResources where listdescriptor = ? and uid = ?', [obj.desc, uid]).then(
          res => {
            if(res.rows.length){
              obj.rid = res.rows[0].rid;
              logger.debug(`Listresource descriptor '${obj.desc}' for user '${uid}' already exists with id '${obj.rid}'.`);
            }
            return obj;
          }
        );
      }
    ).then(
      obj => {
        // if we don't have an rid for the listresource descriptor, save it and add the items to the list
        if(!obj.rid){
          return this.saveListResourceDescriptor(obj.desc, uid)
            .then(desc_rid => {
              listResource.rid = desc_rid;
              obj.items.forEach(itemResource => propagateApplyCid(itemResource, listResource.rid));
              listResource.value = obj.items;
              return obj;
            }).then(
              obj => Promise
                .all(obj.item_rids.map(item_rid => this.saveListResourceItem(listResource.rid, item_rid)))
                .then(ignore_ => listResource) // return list resource
            );
        }
        // otherwise load the resource, its items, and its metadata and skip the saving the list resource items as they might be different!
        listResource.rid = obj.rid;
        listResource.value = null;
        return this.fillListResource(listResource);
      }
    );
};

function propagateApplyCid(resource, cid) {
  logger.debug(`Propagating cid '${cid}' to rid '${resource.rid}' (value !== null? ${resource.value !== null}).`);
  resource.cid = cid;
  if (resource.isTripleResource()) {
    propagateApplyCid(resource.value.subject, cid);
    propagateApplyCid(resource.value.predicate, cid);
    propagateApplyCid(resource.value.object, cid);
  }
}

function computeListResourceDescriptor(list_of_ints){
  // get a string representation
  const listResourceDescriptorString = 'l:[' + list_of_ints.join(',') + ']';
  // gte the hash representation
  const listResourceDescriptor = murmurhashNative.murmurHash128x64(listResourceDescriptorString);
  return listResourceDescriptor;
}

module.exports.saveListResourceDescriptor = function (listResourceDescriptor, uid) {
  return new Promise((resolve, reject) => {
    logger.debug(`Saving listResourceDesriptor '${listResourceDescriptor}' for user with id '${uid}'.`);
    promisedQuery('select get_or_add_listResource(?, ?) as rid', [listResourceDescriptor, uid]).then(
      res => {
        const rid = res.rows[0].rid;
        logger.debug(`Successfully saved resource '${listResourceDescriptor}' with id ${rid}.`);
        return resolve(rid);
      },
      err => reject(err)
    );
  });
};

module.exports.saveListResourceItem = function (desc_rid, item_rid) {
  return new Promise((resolve, reject) => {
    logger.debug(`Saving list resource item (${desc_rid},${item_rid}).`);
    promisedQuery('select add_listResourceItem(?, ?) as existed', [desc_rid, item_rid]).then(
      res => {
        const existed = res.rows[0].existed;
        logger.debug(`Successfully saved list resource item (${desc_rid},${item_rid}). Existed before: ${existed}.`);
        return resolve(existed);
      },
      err => reject(err)
    );
  });
};

module.exports.saveStringResource = function (stringResource, uid) {
  return new Promise((resolve, reject) => {
    logger.debug(`Saving resource value '${stringResource.value}' for user with id '${uid}'.`);
    promisedQuery('select get_or_add_stringResource(?, ?) as rid', [stringResource.value, uid]).then(
      res => {
        const rid = res.rows[0].rid;
        logger.debug(`Successfully saved resource value '${stringResource.value}' with rid '${rid}'.`);
        stringResource.rid = rid;
        return resolve(stringResource);
      },
      err => reject(err)
    );
  });
};

module.exports.saveStorageItem = function (userid, storagekey) {
  logger.debug(`Saving storage '${storagekey}' for user with id '${userid}'.`);
  return promisedQuery('select get_or_add_storageItem(?,?) as sid', [userid, storagekey])
    .then(
      res => {
        const sid = res.rows[0].sid;
        logger.debug(`Successfully saved storgae '${storagekey}' for user with id '${userid}'.`);
        return sid;
      }
    );
};

module.exports.saveStorageItemToResourceMapping = function (sid, rid) {
  return new Promise((resolve, reject) => {
    logger.debug(`Saving storage resource mapping (${sid},${rid}).`);
    promisedQuery('select create_storageItemToResourceMapping(?,?) as mapping_existed', [sid, rid]).then(
      res => {
        const mapping_existed = res.rows[0].mapping_existed;
        logger.debug(`Successfully saved storage-resource mapping (${sid},${rid}). Existed before: ${mapping_existed}.`);
        return resolve(mapping_existed);
      },
      err => reject(err)
    );
  });
};

module.exports.getResource = function (rid, cid) {
  return promisedQuery('select * from resources where rid = ?', [rid])
    .then(res => {
      if (!res.rows.length) {
        logger.debug(`Resource '${rid}' does not exist`);
        return null;
      }
      const r = res.rows[0];
      const newresource = new Resource(rid, null, cid);
      if (r.istriple) {
        logger.debug(`Requesting triple resource '${rid}'.`);
        return this.fillTripleResource(newresource);
      }
      if (r.islist) {
        logger.debug(`Requesting list resource '${rid}'.`);
        return this.fillListResource(newresource);
      }
      if (r.isstring) {
        logger.debug(`Requesting string resource '${rid}'.`);
        return this.fillStringResource(newresource);
      }
      throw new Error('This is impossible, a resource has to be one of {list,triple,string}.');
    })
    .then(resource => this.fillMetadata(resource));
};

module.exports.fillStringResource = function (resource) {
  return promisedQuery('select surfaceform from stringResources where rid = ?', [resource.rid])
    .then(res => {
      if (!res.rows.length) {
        logger.debug(`String resource '${resource.rid}' does not exist`);
        return null;
      }
      resource.value = res.rows[0].surfaceform;
      return resource;
    });
};

module.exports.fillTripleResource = function (resource) {
  return promisedQuery('select * from tripleResources where rid = ?;', [resource.rid])
    .then(res => {
      if (!res.rows.length) {
        logger.debug(`Triple resource '${resource.rid}' does not exist`);
        return null;
      }
      return Promise.resolve(res.rows[0])
        .then(row => [row.subj, row.pred, row.obj])
        .then(rids => Promise.all(rids.map(rid => this.getResource(rid, resource.cid))))
        .then(resources => {
          resource.value = new Triple(resources[0], resources[1], resources[2]);
          return resource;
        });
    });
};

module.exports.fillListResource = function (resource) {
  return promisedQuery('select * from listResourceItems where rid = ?', [resource.rid])
    .then(res => res.rows.map(r => r.itemrid))
    .then(item_rids => Promise.all(item_rids.map(item_rid => this.getResource(item_rid, resource.rid))))
    .then(item_resources => {
      resource.value = item_resources;
      return resource;
    });
};

module.exports.getMetadata = function (rid) {
  return promisedQuery('select * from resourceMetadata where rid = ?', [rid])
    .then(res => res.rows.map(r => Object({ key: r.mkey, val: r.mvalue })))
    .then(kvps => kvps.reduce((acc, kvp) => { acc[kvp.key] = kvp.val; return acc; }, {}));
};

module.exports.fillMetadata = function (resource) {
  return this.getMetadata(resource.rid)
    .then(metadata => {
      resource.metadata = metadata;
      return resource;
    });
};

module.exports.getStorageResourceId = function (uid, storagekey) {
  return promisedQuery('select s2r.rid as rid from storageItems s, storageItemToResource s2r where s2r.sid = s.sid and s.storagekey = ? and s.uid = ?', [storagekey, uid])
    .then(res => {
      if (!res.rows.length) {
        logger.debug(`Storage item '${storagekey}' for user with id '${uid}' does not exist`);
        return null;
      }
      return res.rows[0].rid;
    });
};

module.exports.getStorageResource = function (userid, storagekey) {
  return this.getStorageResourceId(userid, storagekey)
    .then(rid => rid && this.getResource(rid, -1) || null)
    .then(res => {
      if(res){
        return this.fillSourcesRecursive(userid, res);
      }
      return null;
    })
    ;
};

module.exports.deleteResource = function (resource, userid) {
  const r = Resource.asResource(resource);
  if (r.isListResource()) {
    return promisedQuery('call remove_listResourceFromContainer(?,?)', [resource.rid, resource.cid]);
  }
  if (r.isTripleResource()) {
    return promisedQuery('call remove_tripleResourceFromContainer(?,?)', [resource.rid, resource.cid]);
  }
  // else its a string resource
  return promisedQuery('call remove_stringResourceFromContainer(?,?)', [resource.rid, resource.cid]);
};

module.exports.moveResource = function (rid, cid_before, cid_after) {
  return promisedQuery('call edit_resourceContainer(?,?,?)', [rid, cid_before, cid_after]);
};

module.exports.updateMetadata = function (rid, metadataBefore, metadataAfter) {
  return Promise.resolve(1)
     // updates or creations
    .then(_ignore_ => {
      return Promise.all(Object.keys(metadataAfter)
        .filter(k => metadataBefore[k] !== metadataAfter[k])
        .map(k => promisedQuery('replace into resourceMetadata (rid, mkey, mvalue) values(?, ?, ?)', [rid, k, metadataAfter[k]]))
      );
    })
    .then(_ignore_ => {
      // deletions
      return Promise.all(Object.keys(metadataBefore)
        .filter(k => !(k in metadataAfter) || metadataAfter[k] === null)
        .map(k => promisedQuery('delete from resourceMetadata where rid = ? and mkey = ?', [rid, k])));
    });
};

module.exports.info = function (userid, callback) {
  return callback(new Exception('NOT YET IMPLEMENTED'));
};

module.exports.resetDatabase = function () {
  logger.debug('Resetting database.');
  return promisedQuery('call reset_database');
};

module.exports.promisedEditResource = function (userid, resourceBefore, resourceAfter) {

  /*
   * check what kind of edit needs to be performed, possible actions are:
   * 1. create a new resource
   * 2. delete a resource
   * 3. change container
   * 4. change metadata properties, eg. "label"
   */

  // 1: create a new resource if resourceBefore does not exist
  if (!resourceBefore) {
    if (!resourceAfter) {
      return null;
    }
    logger.debug('Creating new resource.');
    return this.saveNewResourceOrValue(resourceAfter, userid, resourceAfter.cid);
  }

  // 2: delete resource if resourceAfter is null
  if (!resourceAfter) {
    logger.debug('Removing resource.');
    return this.deleteResource(resourceBefore, userid).then(_ignore_ => null);
  }

  // make sure resourceBefore and resourceAfter are the same, i.e. they have the same rid
  if (resourceBefore.rid !== resourceAfter.rid) {
    return Promise.reject(new Exception(`Illegal State', 'Resources after and before must have the same rid, but is: ${resourceBefore.rid} and ${resourceAfter.rid}`));
  }

  // 3. move resource from old cid to new cid
  if (resourceBefore.cid !== resourceAfter.cid) {
    logger.debug('Moving resource.');
    return this.moveResource(resourceBefore.rid, resourceBefore.cid, resourceAfter.cid)
      .then(_ignore_ => resourceAfter);
  }

  // 4. change metadata
  if (resourceBefore.metadata !== resourceAfter.metadata) {
    logger.debug("Changing resource's metadata.");
    return this.updateMetadata(resourceBefore.rid, resourceBefore.metadata, resourceAfter.metadata)
      .then(_ignore_ => resourceAfter);
  }

  // 5. change value
  if (resourceBefore.value !== resourceAfter.value) {
    return Promise.reject(new Exception('NotImplemented', 'This operation is currently not implemented!'));
  }

  // otherwise nothing has changed
  logger.debug('Resource is unchanged.');
  return Promise.accept(resourceAfter);
};

module.exports.promisedSaveFile = function(userid, filename, encoding, mimetype, size, content, overwrite) {
  return this.getDocumentId(userid, filename)
    .then(did => new Promise((resolve, reject) => {
      if(did) {
        const msg = `File already exists for user ${userid}: '${filename}'.`;
        if(!overwrite) {
          return reject(new Exception('IllegalState', `${msg} Specify overwrite if you want to update the file.`));
        }
        logger.warn(`File already exists for user ${userid}: '${filename}' OVERWRITING!.`);
      }
      if(size > MAX_FILESIZE) {
        return reject(new Exception('IllegalState', `Size of the file is too large (${size} > ${MAX_FILESIZE}). Upload smaller files or ask your administrator to increase the file size limit.`));
      }
      return promisedQuery('select add_document(?,?,?,?) as did', [userid, filename, encoding, mimetype])
        .then(
          res => {
            const did = res.rows[0].did;
            logger.debug(`Successfully saved file '${filename}' for user with id '${userid}'.`);
            const storeAt = getFileLocation(userid, did);
            logger.debug(`Saving file '${storeAt}'.`);
            return fs.writeFile(storeAt, content, 'binary', function(err) {
              if(err) {
                return reject(Exception.fromError(err, `Storing file '${filename}' failed.`));
              }
              logger.debug(`Saved file '${storeAt}'.`);
              return resolve(did);
            });
          }, err => reject(err));
    }));
};

module.exports.promisedListFiles = function(userid, detailed) {
  if(!detailed){
    return promisedQuery('select did from documents where uid = ?', [userid])
      .then(res => res.rows.map(row => row.did));
  }else{
    return promisedQuery('select did, name, mimetype, encoding, (analysis is not null) as analyzed from documents where uid = ?', [userid])
      .then(res => res.rows.map(row => Object({
        did : row.did,
        filename : row.name,
        mimetype : row.mimetype,
        encoding : row.encoding,
        analyzed : row.analyzed,
      })));
  }
};

module.exports.promisedDeleteFile = function(userid, did) {
  return promisedQuery('call remove_document(?,?)', [userid, did])
    .then(
      _ => {
        logger.debug(`Deleted file from database '${did}'.`);
        const storeAt = getFileLocation(userid, did);
        logger.debug(`Deleting file '${storeAt}' from filesystem.`);
        if (fs.existsSync(storeAt)) { fs.unlinkSync(storeAt); }
        logger.debug(`File deleted '${storeAt}'.`);
      });
};

module.exports.getDocumentId = function(userid, filename) {
  return promisedQuery('select did from documents where uid = ? and name = ?', [userid, filename])
    .then(res => {
      if(res.rows.length > 0){
        return res.rows[0].did;
      }
      return null;
    });
};

module.exports.promisedGetFile = function(uid, did, target) {
  if (target === 'info') {
    return this.getDocumentInfo(uid, did);
  }
  if (target === 'content') {
    return this.getDocumentContent(uid, did);
  }
  if (target === 'analysis') {
    return this.getDocumentAnalysis(uid, did);
  }
};

module.exports.getDocumentInfo = function(uid, did) {
  return promisedQuery('select did, name, mimetype, encoding, (analysis is not null) as analyzed from documents where uid = ? and did = ?', [uid, did])
    .then(res => {
      if(!res.rows){
        return Promise.reject(`Document ${did} not found for user ${did}.`);
      }
      const row = res.rows[0];
      return {
        did : row.did,
        filename : row.name,
        mimetype : row.mimetype,
        encoding : row.encoding,
        analyzed : row.analyzed,
      };
    });
};

module.exports.getDocumentContent = function(uid, did) {
  return new Promise((resolve, reject) => {
    const storeAt = getFileLocation(uid, did);
    logger.debug(`Reading file content from file system: '${storeAt}'.`);
    if (!fs.existsSync(storeAt)) {
      return reject(new Exception('IllegalState', `File '${did}' for user '${uid}' does not exist.`));
    }
    fs.readFile(storeAt, 'binary', function (err, data) {
      if (err) {
        return reject(Exception.fromError(err, `Error while reading file '${did}' for user '${uid}'.`));
      }
      resolve(data);
    });
  });

};

module.exports.getDocumentAnalysis = function(uid, did) {
  return promisedQuery('select name, mimetype, analysis from documents where uid = ? and did = ?', [uid, did])
    .then(res => new Promise((resolve,reject) => {
      if(!res.rows){
        return reject(new Exception('IllegalState', `Document ${did} not found for user ${uid}.`));
      }
      const row = res.rows[0];
      if(!row.analysis){
        new Exception('IllegalState', `Document ${did} has not yet been analyzed ${uid}.`).log(logger.info);
        return resolve(null);
      }
      return resolve(new Analysis().deepAssign(JSON.parse(row.analysis)));
    }));
};

module.exports.updateDocumentAnalysis = function(uid, did, analysis) {
  return promisedQuery('update documents set analysis = ? where uid = ? and did = ?', [JSON.stringify(analysis), uid, did])
    .then(_ => true);
};


module.exports.getStorageKey = function(uid, rids){
  if(!rids){
    return Promise.resolve([]);
  }
  if(Array.isArray(rids) && !rids.length){
    return Promise.resolve([]);
  }
  // get the storageItemKeys for each rid if it exists
  return promisedQuery(`select distinct(storagekey) from storageItems s1 join storageItemToResource s2 on (s1.sid = s2.sid) where s1.uid = ? and s2.rid in ( ? )`, [ uid, rids ])
    .then(res => res.rows.map(r => r.storagekey));
};


module.exports.getParentResources = function(uid, rids) {
  if(!rids){
    return Promise.resolve([]);
  }
  if(Array.isArray(rids) && !rids.length){
    return Promise.resolve([]);
  }
  // select only unique elements where the resources are items in another listresource or take part in a tripleresource
  return promisedQuery(
    `select distinct(rid) from (
      select rid from userListResourceItems where uid = ? and itemrid in ( ? )
      union 
      select rid from userTripleResources where uid = ? and ( subj in ( ? ) or obj in ( ? ) or pred in ( ? ) )
     ) _`,
    [ uid, rids, uid, rids, rids, rids ]
  ).then(res => res.rows.map(r => r.rid));
};

module.exports.getSimilarResources = function(uid, query) {
  // select only unique elements where a resource's label is the query or the resource's surfaceForm is the query
  return promisedQuery(
    `select distinct(rid) from (
      select rid from userResourceMetadata where mkey = "label" and uid = ? and mvalue = ? 
      union 
      select rid from userStringresources where uid = ? and surfaceForm = ?
     ) _`,
    [ uid, query, uid, query ]
  ).then(res => res.rows.map(r => r.rid));
};

module.exports.fillSources = function(uid, resource) {
  resource.sources = new Set();
  // if resource is not a string resource, just get its parents and so on
  if(!resource.isStringResource()){
    return Promise.resolve(resource.rid)
      .then(rid => this.getSourcesRecursive(uid, [ rid ], resource.sources, 1))
      .then(_ => resource.sources = Array.from(resource.sources))
      .then(_ => resource);
  }
  // otherwise find resources with a similar label or surfaceform and get sources from them
  return Promise.resolve(resource.metadata.label || resource.value)
    .then(label => this.getSimilarResources(uid, label))
    .then(rids => this.getSourcesRecursive(uid, rids, resource.sources, 1))
    .then(_ => resource.sources = Array.from(resource.sources))
    .then(_ => resource);
};

module.exports.fillSourcesRecursive = function(uid, resource) {
  if(resource.isListResource()){
    return Promise.all(resource.value.map(r => this.fillSourcesRecursive(uid, r)))
      .then(_ => this.fillSources(uid, resource));
  }
  if(resource.isTripleResource()){
    return Promise.all(
      [
        resource.value.subject,
        resource.value.predicate,
        resource.value.object,
      ].map(r => this.fillSourcesRecursive(uid, r))
    ).then(_ => this.fillSources(uid, resource));
  }
  // else resource is a string resource
  return this.fillSources(uid, resource);
};

module.exports.getSourcesForQuery = function(uid, query) {
  const keys = new Set();
  return this.getSimilarResources(uid, query)
    .then(rids => this.getSourcesRecursive(uid, rids, keys, 1))
    .then(_ => keys);
};

module.exports.getSourcesRecursive = function(uid, rids, storagekeys, c){
  if(!rids){
    return;
  }
  if(Array.isArray(rids) && !rids.length){
    return;
  }
  return this.getStorageKey(uid, rids).then(keys => keys.forEach(key => storagekeys.add(key)))
    .then(_ => this.getParentResources(uid, rids))
    .then(parentrids => {
      return this.getSourcesRecursive(uid, parentrids, storagekeys, c+1);
    });
};


module.exports.close = function (callback) {
  pool.end(function (err) {
    if (err) {
      logger.warn(`Closing mysql pool failed.`, err);
      return callback(err);
    }
    // all connections in the pool have ended
  });
  logger.debug('Closed storage database connection.');
  callback(null);
};

// close database connection on exit
nodeCleanup(function (exitCode, signal) {
  // release resources here before node exits
  logger.debug(`About to exit with code: ${exitCode} and signal ${signal}.`);
  module.exports.close((err) => { });
});

