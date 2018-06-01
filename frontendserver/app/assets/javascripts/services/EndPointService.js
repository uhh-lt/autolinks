define([
    'angular'
], function (angular) {
    'use strict';
    angular.module('autolinks.endpointservice', [])
        .factory('EndPointService', ['$rootScope', '$http', '$q', '_', function ($rootScope, $http, $q, _) {
            $rootScope.activeService = [];
            $rootScope.activeTypes = ['AnatomicalSiteMention', 'MedicationMention'];
            $rootScope.listServices = {};
            $rootScope.serviceName = "";
            $rootScope.serviceVersion = "";
            $rootScope.text = "";
            return {
              fetchService: function() {
                return $http.get('/api/service/listServices').then(function(response) {
                  _.forEach(response.data, function(l) {
                    _.forEach(l.endpoints, function(e) {
                      e["enabled"] = false;
                    });
                  });
                  $rootScope.listServices = response.data;
                  return response;
                 });
              },

              toggleService: function(service) {
                if (service.enabled) {
                  $rootScope.activeService.push(service.path);
                } else {
                  _.pull($rootScope.activeService, service.path);
                  $rootScope.$broadcast('disableEndpoint', service.path);
                }
                // return $rootScope.listServices;
              },

              toggleTypes: function(type) {
                if (type.enabled) {
                  $rootScope.activeTypes.push(type.name);
                } else {
                  _.pull($rootScope.activeTypes, type.name);
                  // $rootScope.$broadcast('disableEndpoint', service.path);
                }
                $rootScope.$broadcast('refreshCarouselBasedOnType');
              },

              getActiveService: function() {
                return $rootScope.activeService;
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
                return $http.post('/api/nlp/analyzeDid', { did: did }).then(function(response) {
                  return response;
                });
              },

              deleteDoc: function(did) {
                return $http.post('/api/storage/deleteDocument', { did: did }).then(function(response) {
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
                  return response;
                });
              },

              getUsername: function() {
                return $http.get('/api/user/getUsername').then(function(response) {
                  return response;
                });
              },

              fetchData: function(data) {
                const promise = $q.defer();
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
