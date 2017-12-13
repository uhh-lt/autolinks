define([
    'angular',
    './components/navs/CirclenavController',
    './components/navs/SidenavController',
    './components/input/InputController',
    './components/viewer/ViewerController',
    './components/network/NetworkController',
    './components/network/GraphController',
    './components/network/GraphConfig',
    './services/EntityService',
    './services/EndPointService',
    './services/underscore-module',
    'ui-layout',
    'ui-router',
    'ui-bootstrap',
    'ngMaterial'
], function (angular) {
    'use strict';

    var app = angular.module('autolinks', [
            'ui.layout', 'ui.router', 'ui.bootstrap', 'underscore',  'autolinks.graphConfig', 'autolinks.network', 'autolinks.graph',
            'autolinks.input', 'autolinks.viewer', 'ngMaterial', 'autolinks.entityservice', 'autolinks.circlenav', 'autolinks.sidenav', 'autolinks.endpointservice'
          ]);

    app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider
        .state('layout', {
            views: {
                'circlenav': {
                  templateUrl: 'assets/partials/navs/circlenav.html',
                  controller: 'CirclenavController'
                },
                'mainnav': {
                  templateUrl: 'assets/partials/navs/mainnav.html'
                },
                'network': {
                  templateUrl: 'assets/partials/network.html',
                  controller: 'GraphController'
                },
                'input': {
                  templateUrl: 'assets/partials/input.html',
                  controller: 'InputController'
                },
                'viewer': {
                  templateUrl: 'assets/partials/viewer.html',
                  controller: 'ViewerController'
                },
                'sidenav': {
                  templateUrl: 'assets/partials/navs/sidenav.html',
                  controller: 'SidenavController'
                }
            }
        });
        $urlRouterProvider.otherwise('/');
    }]);

    app.controller('AppController', ['$scope', '$state', '$mdSidenav', 'EntityService',
        function ($scope, $state, $mdSidenav, EntityService) {

            init();

            function init() {
              $state.go('layout');
            }

            function buildToggler(navID) {
              return function() {
                // Component lookup should always be available since we are not using `ng-if`
                $mdSidenav(navID)
                  .toggle()
                  .then(function () {
                    $log.debug("toggle " + navID + " is done");
                  });
              };
            }
            $scope.toggleRight = buildToggler('right');
            $scope.isOpenRight = function(){
              return $mdSidenav('right').isOpen();
            };

            $scope.getDisplayEntityGraph = function () {
                return true;
            };
        }]);

    return app;
});
