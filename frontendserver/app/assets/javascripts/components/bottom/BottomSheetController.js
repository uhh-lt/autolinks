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
        .controller('BottomSheetController', ['$scope', '$rootScope', 'EndPointService', '$timeout', '$mdBottomSheet', '$mdToast', 'EntityService', '_',
        function ($scope, $rootScope, EndPointService, $timeout, $mdBottomSheet, $mdToast, EntityService, _) {

          $scope.closeChevron = function() {
            $mdBottomSheet.hide();
          };

           $scope.items = [
              { name: 'Fit', icon: 'fa fa-expand fa-2x' },
              { name: 'Fix Layout', icon: 'fa fa-retweet fa-2x' },
              { name: 'Clear', icon: 'far fa-square fa-2x' },
              { name: 'Add', icon: 'fas fa-plus-square fa-2x' },
              { name: 'Edit', icon: 'fas fa-edit fa-2x' },
              { name: 'Delete', icon: 'fas fa-trash-alt fa-2x' },
              { name: 'Compound', icon: 'fa fa-object-group fa-2x' }
            ];

            $scope.listItemClick = function($index) {
              var clickedItem = $scope.items[$index];
              // if (clickedItem.name === 'Fit') {
              //   $rootScope.$emit('centerGraph');
              // }
              switchBottomFunction(clickedItem);
              // $mdBottomSheet.hide(clickedItem);
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
                  $rootScope.$emit('clearAll');
                  break;
                case 'Add':
                  break;
                case 'Edit':
                  break;
                case 'Delete':
                  break;
                case 'Compound':
                  if (cy.$(':selected').length > 0) {
                    EntityService.openSideNav('createCompound');
                  } else {
                    $mdToast.show(
                          $mdToast.simple()
                            .textContent('Please select one or more node to be children')
                            .position('top right')
                            .theme("warn-toast")
                            .hideDelay(3500)
                        );
                    console.log('Please select one or more node to be children');
                  }
                  break;
                default:

              }
            }
        }
      ]);
});
