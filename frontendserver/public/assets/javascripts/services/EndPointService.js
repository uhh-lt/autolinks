define([
    'angular'
], function (angular) {
    'use strict';
    angular.module('myApp.endpointservice', [])
        .factory('EndPointService', ['$rootScope', '$http' function ($rootScope, $http) {
  
            return {
              fetchData: function() {
                $http.get("http://localhost:9200/simplewiki/page/_search")
                 .then(function(response){
                   $scope.details = response.data;
                 });
              }
            };
        }])
});
