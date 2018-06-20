define([
    'angular',
    'jquery'
], function(angular) {
    'use strict';
    /**
     * viewer module:
     */
    angular.module('autolinks.annotation', []);
    angular.module('autolinks.annotation')
        // Viewer Controller
        .controller('NewAnnotationController', ['$window', '$scope', '$rootScope', '$mdDialog', '$q', 'EndPointService', '$mdToast', '$timeout',
        function ($window, $scope, $rootScope, $mdDialog, $q, EndPointService, $mdToast, $timeout) {

          // $scope.entityName = selectedEntity.text
          $scope.entityTypes = $rootScope.newAnnotationTypes;
          $scope.selectedType = '';
          // $scope.isEntityInDoc = $scope.$resolve.parentScope.isEntityInDoc;
          // $scope.isKeyword = $scope.$resolve.parentScope.isKeyword;
          $scope.isKeyword = false;

          $scope.toggleType = function (state) {
            // this.$resolve.parentScope.isNewType = !state;
            $scope.selectedType = '';
          }

          $scope.toggleKeyword = function (state) {
            // this.$resolve.parentScope.isKeyword = !state;
            $scope.selectedType = state === false ? 'key' : '';
          }

          $scope.ok = function () {
            // this.$resolve.parentScope.whitelist(selectedEntity, $scope.selectedType, doc);
            $mdDialog.hide();
            //this.modalClose();
          };

          $scope.cancel = function () {
            // this.$resolve.parentScope.isKeyword = false;
            // this.$resolve.parentScope.isNewType = false;
            this.modalClose();
          };

          $scope.modalClose = function() {
            //this.$resolve.parentScope.isKeyword = false;
            $mdDialog.cancel();
          };

        }
      ]);
});
