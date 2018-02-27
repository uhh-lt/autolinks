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
      .config(function($mdIconProvider) {
          $mdIconProvider
          .iconSet('social', 'img/icons/sets/social-icons.svg', 24)
          .iconSet('device', 'img/icons/sets/device-icons.svg', 24)
          .iconSet('communication', 'img/icons/sets/communication-icons.svg', 24)
          .defaultIconSet('img/icons/sets/core-icons.svg', 24);
        })
        // Mainnav Controller
        .controller('MainnavController', ['$scope', '$rootScope', 'EndPointService',
        function ($scope, $rootScope, EndPointService) {

          $scope.lockLeft = false;

          $rootScope.$on('toggleMainnav', function() {
            $scope.lockLeft = !$scope.lockLeft;
          });

          $scope.init = function() {
            // $timeout( function() {
              $scope.lists = EndPointService.fetchService().then(function(response) {
                $scope.lists = response.data;
              });
              debugger;
              // var entity = $scope.selectedEntity;
              // if (entity._private) {
              //   $scope.label = entity._private.data.name;
              // }
              // console.log($scope.selectedEntity);
              // console.log($scope);
            // }, 1000);
          };

          // EndPointService.fetchService().then(function(response) {
          //   $scope.lists = response.data;
          //   // $scope.settings = [
          //   //   // { name: 'Wi-Fi', extraScreen: 'Wi-fi menu', icon: 'device:network-wifi', enabled: true },
          //   //   // { name: 'Bluetooth', extraScreen: 'Bluetooth menu', icon: 'device:bluetooth', enabled: false },
          //   // ];
          //   //
          //   // _.forEach($scope.list, function(l) {
          //   //   // _.forEach(l.endpoints, function(e) {
          //   //   //   e["enabled"] = true;
          //   //   // });
          //   //   const list = {
          //   //     name: l.name,
          //   //     description: l.description,
          //   //     endpoints: l.endpoints
          //   //     // enabled: true
          //   //   };
          //   //   $scope.settings.push(list);
          //   // });
          // });

          $scope.init();

          $scope.navigateTo = function(service) {
            EndPointService.toggleService(service);
            // debugger;
            // $mdDialog.show(
            //   $mdDialog.alert()
            //     .title('Navigating')
            //     .textContent('Imagine being taken to ' + to)
            //     .ariaLabel('Navigation demo')
            //     .ok('Neat!')
            //     .targetEvent(event)
            // );
          };



        }
      ]);
});
