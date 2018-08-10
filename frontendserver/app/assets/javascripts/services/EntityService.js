define([
    'angular',
    'ngMaterial'
], function (angular) {
    'use strict';
    angular.module('autolinks.entityservice', ['ngMaterial'])
        .factory('EntityService', ['$rootScope', '$mdSidenav', '$mdComponentRegistry', '$timeout', 'EndPointService',
        function ($rootScope, $mdSidenav, $mdComponentRegistry, $timeout, EndPointService) {
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
                // });
                }, 100);
              },

              updateEntity: function(before, after) {

              },

              getRootScopeEntity: function() {
                return $rootScope.entity;
              },

              updateRootScopeEntity: function(entity) {
                $rootScope.entity = entity;
                $rootScope.$emit('updateNode');
              },

              addEntity: function(entity, data) {
                $rootScope.$emit('addEntity', { entity: entity, data: data });
              },

              deleteEntity: function() {
                $rootScope.$emit('deleteEntity');
              }
            };
        }])
});
