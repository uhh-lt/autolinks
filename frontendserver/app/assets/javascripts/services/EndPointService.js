define([
    'angular'
], function (angular) {
    'use strict';
    angular.module('autolinks.endpointservice', [])
        .factory('EndPointService', ['$rootScope', '$http', '$q', '_', function ($rootScope, $http, $q, _) {
            $rootScope.activeServices = [];
            $rootScope.activeTypes = [];
            $rootScope.activeDocs = [];
            $rootScope.selectedDoc = {};
            $rootScope.listServices = {};
            $rootScope.serviceName = "";
            $rootScope.serviceVersion = "";
            $rootScope.text = "";
            $rootScope.annotationSearch = {local: true, ci: false};

            return {
              fetchService: function() {
                return $http.get('/api/service/listServices').then(function(response) {
                  var activeAPIServices = [];
                  _.forEach(response.data, function(l) {
                    if (l.active > 0) {
                      _.forEach(l.endpoints, function(e) {
                        e["enabled"] = false;
                      });
                      activeAPIServices.push(l);
                    }
                  });
                  $rootScope.listServices = activeAPIServices;
                  response.data = activeAPIServices;
                  return response;
                 });
              },

              toggleService: function(service) {
                if (service.enabled) {
                  $rootScope.activeServices.push(service.path);
                } else {
                  _.pull($rootScope.activeServices, service.path);
                  $rootScope.$emit('disableEndpoint', service.path);
                }
                // return $rootScope.listServices;
              },

              toggleTypes: function(type) {
                if (type.enabled) {
                  $rootScope.activeTypes.push(type.name);
                } else {
                  _.pull($rootScope.activeTypes, type.name);
                  // $rootScope.$emit('disableEndpoint', service.path);
                }
                $rootScope.$emit('refreshCarouselBasedOnType');
              },

              setSelectedDoc: function(doc) {
                $rootScope.selectedDoc = doc;
              },

              getSelectedDoc: function() {
                return $rootScope.selectedDoc;
              },

              getActiveService: function() {
                return $rootScope.activeServices;
              },

              getActiveTypes: function() {
                return $rootScope.activeTypes;
              },

              annotateText: function(text) {
                return $http.post('/api/nlp/analyze', { text: text }).then(function(response) {
                  return response;
                });
              },

              loadDoc: function(did) {
                $rootScope.$emit('activateProgressBar', 'loading a document');
                return $http.post('/api/nlp/analyzeDid', { did: did }).then(function(response) {
                  return response;
                });
              },

              interpretDoc: function(did) {
                $rootScope.$emit('activateProgressBar', 'interpreting the document');
                return $http.post('/api/nlp/interpretDid', { did: did }).then(function(response) {
                  return response;
                });
              },

              interpretOffset: function(did, offsets) {
                $rootScope.$emit('activateProgressBar', 'interpreting the offset');
                return $http.post('/api/nlp/interpretDid', { did: did, offsets: offsets }).then(function(response) {
                  var dataPath = { endpoint: { path: 'annotationNode' }};

                  if (response.data) {
                    var containerId = ('annotationContainer');
                    _.forEach(response.data, function(data) { data.parent = containerId});
                    var annotationContainer = { rid: containerId, value: response.data, metadata: { label: 'Annotations', type: 'annotationContainer' }, cid: 0 };

                    return $rootScope.$emit('addEntity', { entity: annotationContainer, data: dataPath });
                  }
                });
              },

              deleteDoc: function(did) {
                return $http.post('/api/storage/deleteDocument', { did: did }).then(function(response) {
                  return response;
                });
              },

              annotationDid: function(annotations) {
                return $http.post('/api/storage/postAnnotationDid', { data: annotations }).then(function(response) {
                  return response;
                });
              },

              editResource: function(data) {
                return $http.post('/api/storage/editResource', { data }).then(function(response) {
                  return response;
                });
              },

              getDocuments: function(data) {
                return $http.get('/api/storage/getDocuments').then(function(response) {
                  return $rootScope.activeService = response;;
                });
              },

              getUsername: function() {
                return $http.get('/api/user/getUsername').then(function(response) {
                  return response;
                });
              },

              getService: function(data) {
                $rootScope.$emit('activateProgressBar', 'calling a service from source');
                return $http.post('/api/service/get', { data: data }).then(function(response) {
                  return data = response.data;
                });
              },

              annotationSearch: function(context, isCi) {
                $rootScope.$emit('activateProgressBar', 'annotation search');
                return $http.post('/api/storage/searchResource', { data: {context: context, isCi: isCi} }).then(function(response) {
                  var source = _.find(response.data, function(d) { return _.includes(d, "annotation::") });
                  if (!source) {
                    $rootScope.$emit('deactivateProgressBar');
                    return { data: [], context };
                  } else {
                    if (_.includes(source, 'annotation::')) {
                      return $http.post('/api/storage/getResource', { data: source }).then(function(response) {
                        const dataPath = { endpoint: { path: 'annotationNode' }};

                        if (response.data) {
                          var containerId = ('annotationContainer').replace(/[^A-Za-z0-9\-_]/g, '-');
                          // _.forEach(response.data, function(data) { data.parent = containerId});
                          response.data.parent = containerId;
                          var annotationContainer = { rid: containerId, value: [response.data], metadata: { label: 'Annotations', type: 'annotationContainer' }, cid: 0 };
                          $rootScope.$emit('addEntity', { entity: annotationContainer, data: dataPath });
                        }
                        return { data: response.data, context };
                        // $rootScope.$emit('addEntity', { entity: response.data, data: dataPath });
                      });
                    }
                    // else {
                    //   return $http.post('/api/storage/getResource', { data: source }).then(function(response) {
                    //     const dataPath = { endpoint: { path: 'annotationSearch' }};
                    //
                    //     if (response.data) {
                    //       $rootScope.$emit('addEntity', { entity: response.data, data: dataPath });
                    //     }
                    //   });
                    // }
                  }
                });
              },

              fetchData: function(data) {
                const promise = $q.defer();
                $rootScope.$emit('activateProgressBar', 'Extracting knowledge graph');
                // let data = [];
                // let list = $rootScope.listServices;
                // $rootScope.text = text;
                // _.forEach(list, function(l) {
                //   $rootScope.serviceName = l.name;
                //   $rootScope.serviceVersion = l.version;
                //   _.forEach(l.endpoints, function(e) {
                //     data.push({
                //       text: $rootScope.text,
                //       name: $rootScope.serviceName,
                //       version: $rootScope.serviceVersion,
                //       endpoint: e
                //     });
                //   });
                // });
                return $http.post('/api/service/call', { data: data }).then(function(response) {
                  return data = response.data;
                });
              }
            };
        }])
});
