-- create and use the database if it doesn't exist
-- CREATE DATABASE IF NOT EXISTS autolinks;
-- USE autolinks;

-- create the tables
CREATE TABLE IF NOT EXISTS documents (
  did         int unsigned NOT NULL AUTO_INCREMENT,
  uid         int unsigned,
  name        varchar(512) NOT NULL,
  encoding    varchar(64) NOT NULL,
  mimetype    varchar(128) NOT NULL,
  analysis    JSON DEFAULT NULL,
  PRIMARY KEY (did, uid),
  KEY (did),
  KEY (uid),
  KEY (name(250))
);
-- ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS resourceToDocument (
  did int unsigned NOT NULL,
  rid int unsigned NOT NULL,
  PRIMARY KEY (did, rid),
  KEY (did),
  KEY (rid)
);
-- ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS resources (
  rid         int unsigned NOT NULL AUTO_INCREMENT,
  uid         int unsigned,
  isstring    boolean DEFAULT NULL,
  istriple    boolean DEFAULT NULL,
  islist      boolean DEFAULT NULL,
  PRIMARY KEY (rid, uid),
  KEY (rid),
  KEY (uid)
);
--ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS resourceMetadata (
  rid          int unsigned NOT NULL,
  mkey         varchar(64) NOT NULL,
  mvalue       text NOT NULL,
  PRIMARY KEY (rid, mkey),
  KEY (mkey)
);
--ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS stringResources (
  rid         int unsigned NOT NULL,
  surfaceform varchar(256) NOT NULL,
  PRIMARY KEY (rid),
  KEY (surfaceform(242)),
  UNIQUE KEY (rid, surfaceform(242))
);
-- ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS tripleResources (
  rid  int unsigned NOT NULL,
  subj int unsigned NOT NULL,
  pred int unsigned NOT NULL,
  obj  int unsigned NOT NULL,
  PRIMARY KEY (rid),
  KEY (subj),
  KEY (pred),
  KEY (obj),
  UNIQUE spo (rid, subj, pred, obj)
);
-- ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS listResources (
  rid            int unsigned NOT NULL,
  listdescriptor varchar(256) NOT NULL,
  PRIMARY KEY (rid),
  KEY (listdescriptor(250)),
  UNIQUE (rid, listdescriptor(242))
);
-- ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS listResourceItems (
  rid     int unsigned NOT NULL,
  itemrid int unsigned NOT NULL,
  PRIMARY KEY (rid, itemrid),
  KEY (rid),
  KEY (itemrid)
);
-- ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS resourcePermission (
  rid         int unsigned NOT NULL,
  uid         int unsigned NOT NULL,
  r           boolean DEFAULT TRUE,
  w           boolean DEFAULT NULL,
  PRIMARY KEY (rid, uid),
  KEY (uid),
  KEY (rid)
);
-- ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS storageItems (
  sid        int unsigned NOT NULL AUTO_INCREMENT,
  uid        int unsigned NOT NULL,
  storagekey varchar(512) NOT NULL,
  PRIMARY KEY (sid, uid, storagekey(234)),
  KEY (uid, storagekey(234)),
  KEY (storagekey(234))
);
-- ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS storageItemToResource (
  sid int unsigned NOT NULL,
  rid int unsigned NOT NULL,
  PRIMARY KEY (sid, rid),
  KEY (sid),
  KEY (rid)
);
-- ENGINE=MyISAM;

-- CREATE HELPER VIEWS
--CREATE OR REPLACE VIEW userResourceMetadata  AS SELECT r1.uid, r2.* FROM resources r1 JOIN resourceMetadata  r2 ON (r1.rid = r2.rid);
--CREATE OR REPLACE VIEW userStringResources   AS SELECT r1.uid, r2.* FROM resources r1 JOIN stringResources   r2 ON (r1.rid = r2.rid);
--CREATE OR REPLACE VIEW userTripleResources   AS SELECT r1.uid, r2.* FROM resources r1 JOIN tripleResources   r2 ON (r1.rid = r2.rid);
--CREATE OR REPLACE VIEW userListResources     AS SELECT r1.uid, r2.* FROM resources r1 JOIN listResources     r2 ON (r1.rid = r2.rid);
--CREATE OR REPLACE VIEW userListResourceItems AS SELECT r1.uid, r2.* FROM resources r1 JOIN listResourceItems r2 ON (r1.rid = r2.rid);

-- DEFINE SOME HELPER FUNCTIONS

drop procedure if exists reset_database;

drop function if exists add_document;

drop function if exists add_resource;

drop function if exists get_or_add_stringResource;

drop function if exists get_or_add_tripleResource;

drop function if exists get_or_add_listResource;

drop function if exists add_listResourceItem;

drop function if exists get_or_add_storageItem;

drop function if exists create_storageItemToResourceMapping;

-- DEFINE SOME HELPER PROCEDURES

drop procedure if exists remove_document;

drop procedure if exists full_delete_resource;

drop procedure if exists remove_stringResourceFromContainer;

drop procedure if exists remove_tripleResourceFromContainer;

drop procedure if exists remove_listResourceFromContainer;

drop procedure if exists edit_resourceContainer;

drop procedure if exists search_resource;

drop procedure if exists get_parent_resources;

DELIMITER //

create procedure reset_database( )
MODIFIES SQL DATA
BEGIN
  START TRANSACTION ;
    truncate documents;
    truncate resourceToDocument;
    truncate stringResources;
    truncate tripleResources;
    truncate listResources;
    truncate listResourceItems;
    truncate resourceMetadata;
    truncate resources;
    truncate resourcePermission;
    truncate storageItemToResource;
    truncate storageItems;
  COMMIT ;
END //

create function add_document ( uid_ int unsigned, name_ varchar(512), encoding_ varchar(64), mimetype_ varchar(128) )
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare did_ int unsigned default 0;
  if name_ is NULL then
    return did_;
  end if;
  select did into did_ from documents where name = name_ and uid = uid_ limit 1;
  if did_ = 0 then
    insert into documents set uid = uid_, name = name_, encoding = encoding_, mimetype = mimetype_, analysis = null;
    select LAST_INSERT_ID() into did_;
  else
    -- delete the linked resources for the document
    delete from resourceToDocument where did = did_;
    replace into documents set did = did_, uid = uid_, name = name_, encoding = encoding_, mimetype = mimetype_, analysis = null;
  end if;
  return did_;
END //

create function add_resource ( isstring_ boolean, istriple_ boolean, islist_ boolean, uid_ int unsigned )
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare rid_ int unsigned default 0;
  -- TODO: check if permutated values are set
  if NOT ( isstring_ AND istriple_ AND islist_) then
    return rid_;
  end if;
  insert into resources set uid = uid_, isstring = isstring_, istriple = istriple_, islist = islist_;
  select LAST_INSERT_ID() into rid_;
  return rid_;
END //

create procedure full_delete_resource( IN rid_ int unsigned )
MODIFIES SQL DATA
BEGIN
  START TRANSACTION ;
    -- delete the resource from every possible entry there might be
    delete from resources where rid = rid_;
    delete from listResourceItems where itemrid = rid_;
    delete from tripleResources where subj = rid_;
    delete from tripleResources where pred = rid_;
    delete from tripleResources where obj = rid_;
    -- only for stringResources
    delete from stringResources where rid = rid_;
    -- only for tripleResources
    delete from tripleResources where rid = rid_;
    -- only for listResources
    delete from listResources where rid = rid_;
    delete from storageItemToResource where rid = rid_;
  COMMIT ;
END //

create function get_or_add_stringResource ( surfaceform_ varchar(512), uid_ int unsigned )
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare rid_ int unsigned default 0;
  if surfaceform_ is NULL then
    return rid_;
  end if;
  select r1.rid into rid_ from resources r1 JOIN stringResources r2 ON (r1.rid = r2.rid) where r2.surfaceform = surfaceform_ and r1.uid = uid_ limit 1;
  if rid_ = 0 then
    select add_resource(TRUE, NULL, NULL, uid_) into rid_;
    insert into stringResources set rid = rid_, surfaceform = surfaceform_;
  end if;
  return rid_;
END //

create function get_or_add_tripleResource ( subj_ int unsigned, pred_ int unsigned, obj_ int unsigned, uid_ int unsigned)
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare rid_ int unsigned default 0;
  select r1.rid into rid_ from resources r1 JOIN tripleResources r2 ON (r1.rid = r2.rid) where r2.subj = subj_ and r2.pred = pred_ and r2.obj = obj_ and r1.uid = uid_ limit 1;
  if rid_ = 0 then
    select add_resource(NULL, TRUE, NULL, uid_) into rid_;
    insert into tripleResources set rid = rid_, subj = subj_, pred = pred_, obj = obj_;
  end if;
  return rid_;
END //

create function get_or_add_listResource ( listdescriptor_ varchar(512), uid_ int unsigned )
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare rid_ int unsigned default 0;
  if listdescriptor_ is NULL then
    return rid_;
  end if;
  select r1.rid into rid_ from resources r1 JOIN listResources r2 ON (r1.rid = r2.rid) where r2.listdescriptor = listdescriptor_ and r1.uid = uid_ limit 1;
  if rid_ = 0 then
    select add_resource(NULL, NULL, TRUE, uid_) into rid_;
    insert into listResources set rid = rid_, listdescriptor = listdescriptor_;
  end if;
  return rid_;
END //

create function add_listResourceItem ( rid_ int unsigned, itemrid_ int unsigned )
RETURNS boolean DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare list_item_existed boolean default false;
  select count(*) > 0 into list_item_existed from listResourceItems where rid = rid_ and itemrid = itemrid_ limit 1;
  if not list_item_existed then
    insert into listResourceItems set rid = rid_, itemrid = itemrid_;
  end if;
  return list_item_existed;
END //

create function get_or_add_storageItem ( uid_ int unsigned, storagekey_ varchar(512) )
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare sid_ int unsigned default 0;
  -- get the sid
  select sid into sid_ from storageItems where uid = uid_ and storagekey = storagekey_ limit 1;
  if sid_ = 0 then
    insert into storageItems set uid = uid_, storagekey = storagekey_;
    select LAST_INSERT_ID() into sid_;
  end if;
  return sid_;
END //

create function create_storageItemToResourceMapping ( sid_ int unsigned, rid_ int unsigned )
RETURNS boolean DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare mapping_existed boolean default false;
  select count(*) > 0 into mapping_existed from storageItemToResource where sid = sid_ and rid = rid_ limit 1;
  if not mapping_existed then
    insert into storageItemToResource set sid = sid_, rid = rid_;
  end if;
  return mapping_existed;
END //

create procedure remove_document( IN uid_ int unsigned, IN did_ int unsigned )
MODIFIES SQL DATA
BEGIN
  START TRANSACTION ;
    -- delete the linked resources for the document
    delete from resourceToDocument where did = did_;
    -- delete the document
    delete from documents where uid = uid_ and did = did_;
  COMMIT ;
END //

create procedure remove_stringResourceFromContainer( IN rid_ int unsigned, IN cid_ int unsigned )
MODIFIES SQL DATA
BEGIN
  DECLARE rid__ int unsigned;
  DECLARE done BOOLEAN DEFAULT FALSE;
  --
  DECLARE triplecur CURSOR FOR SELECT rid FROM tripleResources WHERE subj = rid_ OR pred = rid_ OR obj = rid_;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done := TRUE;
  --
  START TRANSACTION ;
    -- find triples associated with rid_ and delete them from container with rid = cid_
    OPEN triplecur;
      tripleloop: LOOP
        FETCH triplecur INTO rid__;
        IF done THEN
          LEAVE tripleloop;
        END IF;
        call remove_tripleResourceFromContainer(rid__, cid_);
      END LOOP tripleloop;
    CLOSE triplecur;
    -- delete the resource rid_ from the current view / container with rid = cid_
    delete from listResourceItems where rid = cid_ and itemrid = rid_;
  COMMIT ;
END //

create procedure remove_tripleResourceFromContainer( IN rid_ int unsigned, IN cid_ int unsigned )
MODIFIES SQL DATA
BEGIN
  START TRANSACTION ;
    -- delete the resource rid_ from the current view / container with rid = cid_
    delete from listResourceItems where rid = cid_ and itemrid = rid_;
    -- get subj and obj and make an entry for them in the list if it doesn't exist yet
    select add_listResourceItem(cid_, subj), add_listResourceItem(cid_, obj) from tripleResources where rid = rid_;
  COMMIT ;
END //

create procedure remove_listResourceFromContainer( IN rid_ int unsigned, IN cid_ int unsigned )
MODIFIES SQL DATA
BEGIN
  -- since a hypernode is also a node, we treat it the same way
  -- NOTE: this also removes the childs from the current view!
  call remove_stringResourceFromContainer(rid_, cid_);
END //

create procedure edit_resourceContainer( IN rid_ int unsigned, IN cid_old int unsigned, IN cid_new int unsigned)
MODIFIES SQL DATA
BEGIN
  START TRANSACTION ;
    -- delete the resource rid_ from the current view / container with rid = cid_old
    delete from listResourceItems where rid = cid_old and itemrid = rid_;
    -- make an entry for the rid_ in the list of the new container with rid = cid_new
    select add_listResourceItem(cid_new, rid_);
    -- TODO: think what should happen with tripleResources, and triple resources connected to rid_!
  COMMIT ;
END //

create procedure search_resource( IN uid_ int unsigned, IN term varchar(256), IN caseinsensitive boolean)
READS SQL DATA
BEGIN
  if not caseinsensitive then
    -- default collation utf8mb4_bin
    select distinct(rid) as rid, label as label from (
      select r1.rid as rid, r2.mvalue as label from resources r1 JOIN resourceMetadata r2 ON (r1.rid = r2.rid) where r2.mkey = 'label' and r1.uid = uid_ and r2.mvalue = term
      union
      select r1.rid as rid, r2.surfaceForm as label from resources r1 JOIN stringResources r2 ON (r1.rid = r2.rid) where r1.uid = uid_ and r2.surfaceForm = term
    ) _;
  else
    -- use collation utf8mb4_general_ci for searching
    select distinct(rid) as rid, label as label from (
      select r1.rid as rid, r2.mvalue as label from resources r1 JOIN resourceMetadata r2 ON (r1.rid = r2.rid) where r2.mkey = 'label' and r1.uid = uid_ and r2.mvalue COLLATE utf8mb4_general_ci = term
      union
      select r1.rid as rid, r2.surfaceForm as label from resources r1 JOIN stringResources r2 ON (r1.rid = r2.rid) where r1.uid = uid_ and r2.surfaceForm COLLATE utf8mb4_general_ci = term
    ) _;
  end if;
END //

create procedure get_parent_resources( IN uid_ int unsigned, IN rid_ int unsigned)
READS SQL DATA
BEGIN
  select distinct(rid) from (
    select r1.rid as rid from resources r1 JOIN listResourceItems r2 ON (r1.rid = r2.rid) where r1.uid = uid_ and r2.itemrid = rid_
    union
    select r1.rid as rid from resources r1 JOIN tripleResources r2 ON (r1.rid = r2.rid) where r1.uid = uid_ and ( r2.subj = rid_ or r2.obj = rid_ or r2.pred = rid_ )
  ) _;
END //

DELIMITER ;