define([
    'angular'
], function (angular) {
    'use strict';
    angular.module('autolinks.endpointservice', [])
        .factory('EndPointService', ['$rootScope', '$http', '$q', '_', function ($rootScope, $http, $q, _) {
            $rootScope.listServices = {};
            $rootScope.serviceName = "";
            $rootScope.serviceVersion = "";
            $rootScope.text = "";
            return {
              fetchService: function() {
                return $http.get('/api/service/listServices').then(function(response) {
                  $rootScope.listServices = response.data;
                  return response;
                 });
              },

              annotateText: function(text) {
                return $http.post('/api/nlp/analyze', { text: text }).then(function(response) {
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
