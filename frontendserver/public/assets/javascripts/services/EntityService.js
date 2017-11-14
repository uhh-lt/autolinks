define([
    'angular',
    'ngMaterial'
], function (angular) {
    'use strict';
    angular.module('myApp.entityservice', ['ngMaterial'])
        .factory('EntityService', ['$rootScope', '$mdSidenav', '$mdComponentRegistry', '$timeout', function ($rootScope, $mdSidenav, $mdComponentRegistry, $timeout) {
            var entityScope = null;
            $rootScope.entity = {};
            return {
              openSideNav: function(scope) {
                debugger;
                $rootScope.entity = scope;
                // console.log($rootScope);
                $timeout(function () {
                // $mdComponentRegistry.when('right', true).then(function() {
                  debugger;
                  // Now you can use $mdSidenav('left') or $mdSidenav('left', true) without getting an error.
                  $mdSidenav('right').toggle();
                // });
              }, 1000);
              },

              getRootScopeEntity: function() {
                debugger;
                return $rootScope.entity;
              }
            };
        }])
});
