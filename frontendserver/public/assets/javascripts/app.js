define([
    'angular',
    './components/input/InputController',
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
            'ui.layout', 'ui.router', 'ui.bootstrap', 'underscore',  'myApp.graphConfig', 'myApp.network', 'myApp.input'
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
