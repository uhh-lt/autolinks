define([
    'angular',
    './components/input/InputController',
    './components/viewer/ViewerController',
    './components/network/NetworkController',
    './components/network/GraphConfig',
    './services/underscore-module',
    'ui-layout',
    'ui-router',
    'ui-bootstrap',
    'ngMaterial'
], function (angular) {
    'use strict';

    var app = angular.module('myApp', [
            'ui.layout', 'ui.router', 'ui.bootstrap', 'underscore',  'myApp.graphConfig', 'myApp.network', 'myApp.input', 'myApp.viewer'
          ]);

    app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider
        .state('layout', {
            views: {
                'network': {
                    templateUrl: 'assets/partials/network.html',
                    controller: 'NetworkController'
                },
                'input': {
                  templateUrl: 'assets/partials/input.html',
                  controller: 'InputController'
                },
                'viewer': {
                  templateUrl: 'assets/partials/viewer.html',
                  controller: 'ViewerController'
                }
            }
        });
        $urlRouterProvider.otherwise('/');
    }]);

    app.controller('AppController', ['$scope', '$state',
        function ($scope, $state) {

            init();

            function init() {
                $state.go('layout');
            }

            $scope.getDisplayEntityGraph = function () {
                return true;
            };
        }]);

    return app;
});
