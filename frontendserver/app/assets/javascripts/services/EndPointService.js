define([
    'angular'
], function (angular) {
    'use strict';
    angular.module('autolinks.endpointservice', [])
        .factory('EndPointService', ['$rootScope', '$http', '$q', function ($rootScope, $http, $q) {

            return {
              fetchService: function() {
                debugger;
                $http.get('/api/service/listServices').then(function(response){
                   console.log(response);
                  //  $scope.details = response.data;
                 });
                // $http({
                //     url: 'http://localhost:8080/find',
                //     method: 'POST',
                //     headers: {
                //        'Content-Type': 'application/json',
                //        'Accept': 'application/json'
                //      },
                //     data: {
                //       "query": {
                //           "query": {
                //               "match": {
                //                   "title": "Germany"
                //       }
                //           }
                //       },
                //         "wiki": [
                //           "simplewiki"
                //         ]
                //     }
                //  )
                // .then(function(response){
                //   console.log(response);
                // });
                // var dataObj = {
                //   "query": {
                //      "query": {
                //        "match_all": {}
                //      }
                //    },
                //    "wiki": [
                //      "simplewiki"
                //    ]
                //  };
                // var res = $http.post('http://localhost:8080/find', dataObj, { headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}});
                // res.success(function(data, status, headers, config) {
                //   $scope.message = data;
                // });
              },

              fetchData: function(text) {
                var promise = $q.defer();
                var data = {};
                return $http.post('/api/service/call', { text: text }).then(function(response) {
                  return data = response.data;
                });
                // return promise.promise;
              }
            };
        }])
});
