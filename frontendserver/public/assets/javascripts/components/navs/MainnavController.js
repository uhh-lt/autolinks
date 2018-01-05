define([
    'angular',
    'jquery'
], function(angular, $) {
    'use strict';
    /**
     * Mainnav module:
     */
    angular.module('autolinks.mainnav', []);
    angular.module('autolinks.mainnav')
        // Mainnav Controller
        .controller('MainnavController', ['$scope', '$rootScope',
        function ($scope, $rootScope) {

          $scope.lockLeft = true;

          $rootScope.$on('toggleMainnav', function() {
            $scope.lockLeft = !$scope.lockLeft;
          });
        }
      ]);
});
