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

          $scope.loadDoc = function(doc) {
            EndPointService.loadDoc(doc.did).then(function(response) {
              $rootScope.$emit('activateCarouselFromDoc', response.data);
            });
          }

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
          }

          $rootScope.$on('addDocument', function(event, newDoc) {
            $scope.loadDoc(newDoc);
            newDoc.filename = newDoc.name;
            $scope.documents.push(newDoc);
            $mdSidenav('left').toggle();
            $scope.toggle.doc;
          });
        }
      ]);
});
