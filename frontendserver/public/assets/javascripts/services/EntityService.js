define([
    'angular',
    'ngMaterial'
], function (angular) {
    'use strict';
    angular.module('autolinks.entityservice', ['ngMaterial'])
        .factory('EntityService', ['$rootScope', '$mdSidenav', '$mdComponentRegistry', '$timeout', function ($rootScope, $mdSidenav, $mdComponentRegistry, $timeout) {
            var entityScope = null;
            $rootScope.entity = {};
            return {
              openSideNav: function(entity) {
                $mdSidenav('right').close();
                $rootScope.entity = entity;
                // console.log($rootScope);
                $timeout(function () {
                // $mdComponentRegistry.when('right', true).then(function() {
                  // Now you can use $mdSidenav('left') or $mdSidenav('left', true) without getting an error.
                  $rootScope.$emit('sidenavReinit');
                  $mdSidenav('right').open();
                // });
                }, 100);
              },

              getRootScopeEntity: function() {
                return $rootScope.entity;
              },

              updateRootScopeEntity: function(entity) {
                $rootScope.entity = entity;
                $rootScope.$broadcast('updateNode');
              },

              deleteEntity: function() {
                $rootScope.$emit('deleteEntity');
              }
            };
        }])
});
