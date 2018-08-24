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

          $scope.newAnnotation = $rootScope.newAnnotations;
          $scope.entityTypes = _.orderBy($rootScope.newAnnotationTypes, 'name', 'asc');;
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
            var selectedDoc = EndPointService.getSelectedDoc();
            $scope.newAnnoType = $scope.selectedType.replace(/\s/g,'');
            EndPointService.annotationDid({did: selectedDoc.did, type: $scope.newAnnoType, newAnnotations: $scope.newAnnotation.offsets}).then(function(response) {
              if (response.status == 200) {
                EndPointService.loadDoc(selectedDoc.did).then(function(response) {
                  $rootScope.$emit('activateCarouselFromWhitelist', response.data);
                  var offsets = [$scope.newAnnotation.offsets[0].start, $scope.newAnnotation.offsets[$scope.newAnnotation.offsets.length - 1].end];
                  EndPointService.interpretOffset(selectedDoc.did, offsets).then(function(response) {
                    $rootScope.$emit('addNewAnnoType', $scope.newAnnoType);
                    // var dataPath = { endpoint: { path: 'annotationNode' }}
                    // $rootScope.$emit('addEntity', { entity: response.data, data: dataPath });
                  });
                });
              };
            });
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
