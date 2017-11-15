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
        .controller('SidenavController', ['$scope', '$rootScope', '$timeout', '$mdSidenav', '$log', 'EntityService', 'EndPointService',
        function ($scope, $rootScope, $timeout, $mdSidenav, $log, EntityService, EndPointService) {

          $scope.init = function() {
            // $timeout( function(){
              $scope.selectedEntity = EntityService.getRootScopeEntity();
            // }, 1000);
          }

          $rootScope.$on('sidenavReinit', function (event, args) {
            debugger;
            $scope.init();
            console.log('sidenavReinit');
          });

          $scope.init();
          // $scope.selectedEntity = EntityService.getRootScopeEntity();
          // console.log(selectedEntity);
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
