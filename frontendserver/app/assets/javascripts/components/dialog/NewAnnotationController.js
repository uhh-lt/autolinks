define([
    'angular',
    'jquery'
], function(angular) {
    'use strict';
    /**
     * new annotation module:
     */
    angular.module('autolinks.annotation', []);
    angular.module('autolinks.annotation')
        // New Annotation Controller
        .controller('NewAnnotationController', ['$window', '$scope', '$rootScope', '$mdDialog', '$q', 'EndPointService', '$mdToast', '$timeout',
        function ($window, $scope, $rootScope, $mdDialog, $q, EndPointService, $mdToast, $timeout) {

          $scope.newAnnotation = $rootScope.newAnnotations;
          $scope.entityTypes = _.orderBy($rootScope.newAnnotationTypes, 'name', 'asc');;
          $scope.selectedType = '';
          $scope.isKeyword = false;

          $scope.toggleType = function (state) {
            $scope.selectedType = '';
          }

          $scope.toggleKeyword = function (state) {
            $scope.selectedType = state === false ? 'key' : '';
          }

          $scope.ok = function () {
            var selectedDoc = EndPointService.getSelectedDoc();
            $scope.newAnnoType = $scope.selectedType.replace(/\s/g,'');
            EndPointService.annotationDid({did: selectedDoc.did, type: $scope.newAnnoType, newAnnotations: $scope.newAnnotation.offsets}).then(function(response) {
              if (response.status == 200) {
                EndPointService.loadDoc(selectedDoc.did).then(function(response) {
                  $rootScope.$emit('activateCarouselFromWhitelist', response.data);
                  var offsets = [$scope.newAnnotation.offsets[0].start, $scope.newAnnotation.offsets[$scope.newAnnotation.offsets.length - 1].end];
                  EndPointService.interpretOffset(selectedDoc.did, offsets).then(function(response) {
                    $rootScope.$emit('addNewAnnoType', $scope.newAnnoType);
                  });
                });
              };
            });
            $mdDialog.hide();
          };

          $scope.cancel = function () {
            this.modalClose();
          };

          $scope.modalClose = function() {
            $mdDialog.cancel();
          };

        }
      ]);
});
