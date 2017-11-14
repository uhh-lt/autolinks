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
                $rootScope.entity = scope;
                // console.log($rootScope);
                $timeout(function () {
                // $mdComponentRegistry.when('right', true).then(function() {
                  // Now you can use $mdSidenav('left') or $mdSidenav('left', true) without getting an error.
                  $rootScope.$emit('sidenavReinit', 'waw');
                  $mdSidenav('right').toggle();
                // });
              }, 1000);
              },

              getRootScopeEntity: function() {
                return $rootScope.entity;
              }
            };
        }])
});
