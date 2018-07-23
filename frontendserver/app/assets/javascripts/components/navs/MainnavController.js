define([
    'angular',
    'jquery',
    'ngMaterial'
], function(angular, $) {
    'use strict';
    /**
     * Mainnav module:
     */
    angular.module('autolinks.mainnav', ['ngMaterial']);
    angular.module('autolinks.mainnav')
      .config(function($mdIconProvider) {
          $mdIconProvider
          .iconSet('social', 'img/icons/sets/social-icons.svg', 24)
          .iconSet('device', 'img/icons/sets/device-icons.svg', 24)
          .iconSet('communication', 'img/icons/sets/communication-icons.svg', 24)
          .defaultIconSet('img/icons/setitems/core-icons.svg', 24);
        })
        // Mainnav Controller
        .controller('MainnavController', ['$scope', '$rootScope', 'EndPointService', '$mdDialog', '$mdSidenav',
        function ($scope, $rootScope, EndPointService, $mdDialog, $mdSidenav) {

          $scope.lockLeft = false;
          $scope.toggle = {};
          $scope.selectedDoc = {};
          $scope.localSearch = $rootScope.localSearch;

          $rootScope.$on('toggleMainnav', function() {
            $scope.lockLeft = !$scope.lockLeft;
          });

          $scope.init = function() {
              EndPointService.fetchService().then(function(response) {
                $scope.lists = response.data;
              });

              EndPointService.getDocuments().then(function(response) {
                $scope.documents = response.data;
              });

              EndPointService.getUsername().then(function(response) {
                $scope.username = response.data;
              });
          };

          $scope.init();

          $scope.navigateTo = function(service) {
            EndPointService.toggleService(service);
          };

          //TODO: this argument is named as typ, to avoid reserved words
          $scope.toggleTypeTo = function(typ) {
            EndPointService.toggleTypes(typ);
            $rootScope.$emit('switchNodesBasedOnTypes');
          };

          $scope.loadDoc = function(doc) {
            EndPointService.setSelectedDoc(doc);
            EndPointService.loadDoc(doc.did).then(function(response) {
              $rootScope.$emit('activateCarouselFromDoc', response.data);
              $rootScope.$emit('deactivateProgressBar');
            });
          };

          $scope.loadNewDoc = function(doc) {
            EndPointService.setSelectedDoc(doc);
            EndPointService.loadDoc(doc.did).then(function(response) {
              $rootScope.$emit('activateCarouselFromDoc', response.data);
              EndPointService.interpretDoc(doc.did);
              $rootScope.$emit('deactivateProgressBar');
            });
          };

          $scope.deleteDoc = function(doc, index) {
            $scope.trash = doc;
            $scope.trashIndex = index;
            var confirm = $mdDialog.confirm()
                 .title('Are you sure to delete document ' + doc.filename + '?')
                 .targetEvent(doc)
                 .ok('Yes, delete it!')
                 .cancel('Cancel');

            $mdDialog.show(confirm).then(function() {
              $scope.documents.splice($scope.trashIndex, 1);
              EndPointService.deleteDoc($scope.trash.did);
            });
          };

          $rootScope.$on('addNewAnnoType', function(event, newAnnoType) {
            var selectedType = _.filter($scope.types, function(type) { return type.name === newAnnoType });
            if (!selectedType[0].enabled) {
              selectedType[0].enabled = true;
              EndPointService.toggleTypes(selectedType[0]);
            }
          });

          $rootScope.$on('addTypes', function(event, types) {
            $scope.types = types;
          });

          $rootScope.$on('checkedDoc', function(event, doc) {
            $scope.selectedDoc = doc;
          });

          $rootScope.$on('addDocument', function(event, newDoc, overwrite = false) {
            $scope.selectedDoc = { did: newDoc.did, name: newDoc.name };
            $scope.loadNewDoc(newDoc);
            newDoc.filename = newDoc.name;
            if (!overwrite) {
              $scope.documents.push(newDoc);
            }
            $mdSidenav('left').toggle();
            $scope.toggle.doc;
          });
        }
      ]);
});
