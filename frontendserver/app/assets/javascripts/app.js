define([
    'angular',
    './components/navs/CirclenavController',
    './components/navs/SidenavController',
    './components/navs/MainnavController',
    './components/input/InputController',
    './components/viewer/ViewerController',
    './components/graph/GraphController',
    './components/graph/GraphConfig',
    './services/EntityService',
    './services/EndPointService',
    './services/lodash-module',
    'ui-layout',
    'ui-router',
    'ui-bootstrap',
    'ngMaterial'
], function (angular) {
    'use strict';

    var app = angular.module('autolinks', [
            'ui.layout', 'ui.router', 'ui.bootstrap', 'lodash', 'autolinks.graphConfig', 'autolinks.graph',
            'autolinks.input', 'autolinks.viewer', 'ngMaterial', 'autolinks.entityservice', 'autolinks.circlenav', 'autolinks.sidenav',
            'autolinks.mainnav', 'autolinks.endpointservice'
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
                  templateUrl: 'assets/partials/navs/mainnav.html',
                  controller: 'MainnavController'
                },
                'graph': {
                  templateUrl: 'assets/partials/graph.html',
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

    app.controller('AppController', ['$scope', '$state', '$mdSidenav', 'EntityService', 'EndPointService',
        function ($scope, $state, $mdSidenav, EntityService, EndPointService) {

            init();

            function init() {
              $state.go('layout');
              EndPointService.fetchService();
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

            $scope.toggleLeft = buildToggler('left');
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
