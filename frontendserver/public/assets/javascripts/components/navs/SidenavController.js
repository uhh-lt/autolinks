define([
    'angular',
], function(angular) {
    'use strict';
    /**
     * viewer module:
     */
    angular.module('autolinks.sidenav', []);
    angular.module('autolinks.sidenav')
        // Viewer Controller
        .controller('SidenavController', ['$scope', '$rootScope', '$timeout', '$mdSidenav', '$log', 'EntityService', 'EndPointService', '_',
        function ($scope, $rootScope, $timeout, $mdSidenav, $log, EntityService, EndPointService, _) {

          $scope.newCompound = '';

          $scope.init = function() {
            // $timeout( function
              $scope.selectedEntity = EntityService.getRootScopeEntity();
              console.log($scope.selectedEntity);
              // console.log($scope);
            // }, 1000);
          }

          $rootScope.$on('sidenavReinit', function (event, args) {
            $scope.init();
          });

          $scope.init();
          // $scope.selectedEntity = EntityService.getRootScopeEntity();
          // console.log(selectedEntity);

          // // add Edges to the edges object, then broadcast the change event
          // $scope.update = function(){
          //     $scope.selectedEntity = EntityService.updateRootScopeEntity($scope.selectedEntity);
          //     // broadcasting the event
          //     // $rootScope.$broadcast('appChanged');
          //     $mdSidenav('right').close();
          // };

          $scope.createCompound = function(){
              $rootScope.$emit('createCompound');
              $mdSidenav('right').close();
          };

          $scope.delete = function(){
              EntityService.deleteEntity();
              $mdSidenav('right').close();
          };

          $scope.close = function () {
            // Component lookup should always be available since we are not using `ng-if`
            // $route.reload();
            EndPointService.fetchData();
            $mdSidenav('right').close()
              .then(function () {
                $log.debug("close RIGHT is done");
              });
          };

        }
      ]);
});
