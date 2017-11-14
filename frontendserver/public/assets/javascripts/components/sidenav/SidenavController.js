define([
    'angular',
], function(angular) {
    'use strict';
    /**
     * viewer module:
     */
    angular.module('myApp.sidenav', []);
    angular.module('myApp.sidenav')
        // Viewer Controller
        .controller('SidenavController', ['$scope', '$timeout', '$mdSidenav', '$log', 'EntityService',
        function ($scope, $timeout, $mdSidenav, $log, EntityService) {

          function init() {
            $timeout( function(){
              $scope.selectedEntity = EntityService.getRootScopeEntity();
            }, 3000);
          }

          init();
          // $scope.selectedEntity = EntityService.getRootScopeEntity();
          // console.log(selectedEntity);
          $scope.close = function () {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav('right').close()
              .then(function () {
                $log.debug("close RIGHT is done");
              });
          };

        }
      ]);
});
