'use strict';

const
  auth = require('../../controller/auth'),
  storage = require('../../controller/storage_wrapper'),
  service_db = require('../../controller/service_db'),
  service_utils = require('../../controller/utils/service_utils'),
  Exception = require('../../model/Exception').model,
  logger = require('../../controller/log')(module);

module.exports.register_service = function(req, res, next) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  const service = req.swagger.params.service.value;
  res.header('Content-Type', 'application/json; charset=utf-8');
  service_db.add_service(
    service.name,
    service.version,
    service.location,
    service.description,
    service.endpoints,
    function(err){
      if(err) {
        return Exception.fromError(err, `Adding service '${service.name}:${service.version}' failed.`, {service: service}).log(logger.warn).handleResponse(res);
      }
      logger.info(`Sucessfully added service '${service.name}:${service.version}'.`);
    },
    function(endpoint, err) {
      if(err) {
        return Exception.fromError(err, `Adding endoint '${endpoint.path}' for '${service.name}:${service.version}' failed.`, {service: service}).log(logger.warn).handleResponse(res);
      }
      logger.info(`Sucessfully added endpoint '${endpoint.path}' for '${service.name}:${service.version}'.`);
    },
    function() {
      res.end(next);
    }
  );
};

module.exports.deregister_service = function(req, res, next) {
  const service = req.swagger.params.service.value;
  service_db.delete_service(service.name, service.version, function(err){
    res.header('Content-Type', 'application/json; charset=utf-8');
    if(err){
      return Exception.fromError(err, `De-register service '${service.name}:${service.version}' failed.`, {service: service}).log(logger.warn).handleResponse(res).end(next);
    }
    logger.info(`Sucessfully removed service '${service.name}:${service.version}' and its endpoints.`, service);
    res.end(next);
  });
};

module.exports.ping_service = function(req, res, next) {
  const service = req.swagger.params.service.value;
  service_utils.ping_service(service, function(err) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    if(err){
      return Exception.fromError(err, `Ping service '${service.name}:${service.version}' failed.`, {service: service}).log(logger.warn).handleResponse(res).end(next);
    }
    res.end(next);
  });
};

module.exports.ping_services = function(req, res, next) {
  // get all services and apply ping_service as callback for each of the services
  service_db.get_services(
    (err, service) => {
      if(err){
        return Exception.fromError(err, `Ping service '${service.name}' failed.`).log(logger.warn).handleResponse(res);
      }
      service_utils.ping_service(service, function(err2) {
        if(err2) {
          return Exception.fromError(err2, `Ping service '${service.name}' failed.`).log(logger.warn).handleResponse(res);
        }
      });
    },
    (err, numrows) => res.end(next)
  );
};

module.exports.list_services = function(req, res, next) {
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.write('[');
  let startedwriting = false;
  service_utils.get_services_and_endpoints(
    function(err, service) {
      if(err) {
        return Exception.fromError(err, 'Could not get services.').handleResponse(res);
      }
      if (startedwriting) {
        res.write(',');
      }
      res.write(JSON.stringify(service));
      startedwriting = true;
    },
    (err, numrows) => {
      res.end(']', next);
    }
  );
};

module.exports.call_service = function(req, res, next) {

  auth.handle_authenticated_request(req, res, function(user) {

    if (!req.swagger.params.data || !req.swagger.params.data.value) {
      return new Exception('MissingInformation', 'No data provided.').handleResponse(res).end(next);
    }

    const data = req.swagger.params.data.value;
    if (!(data.service && data.version && data.path && data.method)) {
      return new Exception('MissingInformation', `Make sure 'service', 'version', 'path' and 'method' are provided.`).handleResponse(res).end(next);
    }

    const serviceref = {name: data.service, version: data.version};
    const endpointref = {path: data.path, method: data.method};
    service_db.get_service_endpoint(
      serviceref,
      endpointref,
      function (err, row) {
        if (err) {
          return Exception.fromError(err, 'Error retrieving service endpoint.', {data: data}).log(logger.warn).handleResponse(res).end(next);
        }
        if (!row) {
          return new Exception('IllegalState', `Service endpoint not found: service '${serviceref.name}:${serviceref.version}', endpoint: '${endpointref.path}'.`, {data: data}).log(logger.warn).handleResponse(res).end(next);
        }
        let path = row.path;
        if (row.requireslogin) {
          path = path.replace(/\{username\}/, user.name);
        }
        return service_utils.call_service(row.location, path, row.method, user.id, data.data, serviceref, endpointref, req, res, next);
      }
    );
  });

};

module.exports.get_service_data = function(req, res, next) {

  auth.handle_authenticated_request(req, res, function(user){

    if(!req.swagger.params.service.value){
      return new Exception('IllegalState', `Service paramter 'service' missing!`).handleResponse(res).end(next);
    }
    const service = req.swagger.params.service.value;

    if(!req.swagger.params.path.value){
      return new Exception('IllegalState', `Service paramter 'path' missing!`).handleResponse(res).end(next);
    }
    const path = req.swagger.params.path.value;

    if(!req.swagger.params.version.value){
      return new Exception('IllegalState', `Service paramter 'version' missing!`).handleResponse(res).end(next);
    }
    const version = req.swagger.params.version.value;

    if(!req.swagger.params.method.value){
      return new Exception('IllegalState', `Service paramter 'method' missing!`).handleResponse(res).end(next);
    }
    const method = req.swagger.params.method.value;

    if(!req.swagger.params.q.value){
      return new Exception('IllegalState', `Service paramter 'qquery key' missing!`).handleResponse(res).end(next);
    }
    const key = req.swagger.params.q.value;

    const storagekey = `service::${service}/${path.replace('/','').replace(/\//g,'%slash%')}/${version}/${method}/?q=${encodeURI(key)}`;

    return storage.promisedRead(user.id, storagekey)
      .then(
        result => res.json(result).end(next),
        err => Exception.fromError(err, 'Error retrieving service data.').log(logger.warn).handleResponse(res).end(next)
      );
  });

};

module.exports.get_service_details = function(req, res, next) {

  if(!req.swagger.params.data || !req.swagger.params.data.value) {
    return new Exception('MissingInformation', 'No data provided.').handleResponse(res).end(next);
  }

  const data = req.swagger.params.data.value;
  if(!data.name){
    return new Exception('MissingInformation', 'No service name provided.').handleResponse(res).end(next);
  }

  service_utils.get_service_details(data.name, data.extended, function(err, service) {
    if(err) {
      return Exception.fromError(err, 'Error while getting service details.').handleResponse(res).end(next);
    }
    if(!service){
      return new Exception('IllegalState', 'Service not found.').handleResponse(res).end(next);
    }
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.write(JSON.stringify(service));
    res.end(next);
    }
  );

};
