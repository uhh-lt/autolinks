define([
    'angular',
    'ngMaterial'
], function(angular) {
    'use strict';
    /**
     * bottom module:
     * BottomSheetController
     */
    angular.module('autolinks.bottom', ['ngMaterial'])
        .controller('BottomSheetController',
        ['$scope', '$rootScope', 'EndPointService', '$timeout', '$mdBottomSheet', '$mdToast', 'EntityService', '_', '$mdDialog',
        function ($scope, $rootScope, EndPointService, $timeout, $mdBottomSheet, $mdToast, EntityService, _, $mdDialog) {

          $scope.closeChevron = function() {
            $mdBottomSheet.hide();
          };

           $scope.items = [
              { name: 'Fit', icon: 'fa fa-expand fa-2x' },
              { name: 'Fix Layout', icon: 'fa fa-retweet fa-2x' },
              { name: 'Clear', icon: 'far fa-square fa-2x' },
            ];

            $scope.listItemClick = function($index) {
              var clickedItem = $scope.items[$index];
              switchBottomFunction(clickedItem);
            };

            function switchBottomFunction(clickedItem) {
              switch (clickedItem.name) {
                case 'Fit':
                  $rootScope.$emit('centerGraph');
                  break;
                case 'Fix Layout':
                  $rootScope.$emit('layoutReset');
                  break;
                case 'Clear':
                  if (cy.$(':selected').length > 0) {
                    cy.$(':selected').remove()
                  } else {
                    var confirm = $mdDialog.confirm()
                         .title('clear all nodes ?')
                         .ok('Yes, clear them!')
                         .cancel('Cancel');

                    $mdDialog.show(confirm).then(function() {
                      $rootScope.$emit('clearAll');
                    });
                  }
                  break;
                case 'Add':
                  break;
                case 'Edit':
                  break;
                case 'Move into':
                  if (cy.$(':selected').length > 0) {
                    $mdBottomSheet.hide();
                    $mdToast.show(
                          $mdToast.simple()
                            .textContent('Please select the target parent')
                            .position('top right')
                            .theme("primary-toast")
                            .hideDelay(3500)
                        );
                    $rootScope.$emit('mergeToParent');
                  } else {
                    $mdToast.show(
                          $mdToast.simple()
                            .textContent('Please select one or more nodes to merge to parent')
                            .position('top right')
                            .theme("warn-toast")
                            .hideDelay(3500)
                        );
                  }
                  break;
                case 'Create new compound':
                  if (cy.$(':selected').length > 0) {
                    EntityService.openSideNav('createCompound');
                  } else {
                    $mdToast.show(
                          $mdToast.simple()
                            .textContent('Please select one or more nodes to be children')
                            .position('top right')
                            .theme("warn-toast")
                            .hideDelay(3500)
                        );
                  }
                  break;
                default:

              }
            }
        }
      ]);
});
