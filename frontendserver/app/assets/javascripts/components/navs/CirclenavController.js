define([
    'angular',
    'jquery',
    'ngMaterial'
], function(angular, $) {
    'use strict';
    /**
     * Circlenav module:
     */
    angular.module('autolinks.circlenav', ['ngMaterial'])
    // angular.module('autolinks.circlenav')
        // Circlenav Controller
        .controller('CirclenavController', ['$scope', '$rootScope', '$timeout', '$mdBottomSheet', '$mdToast', '$mdDialog', '$mdSidenav', 'EntityService',
        function ($scope, $rootScope, $$timeout, $mdBottomSheet, $mdToast, $mdDialog, mdSidenav, EntityService) {

         this.topDirections = ['left', 'up'];
         this.bottomDirections = ['down', 'right'];

         this.isOpen = false;

         this.availableModes = ['md-fling', 'md-scale'];
         this.selectedMode = 'md-fling';

         this.availableDirections = ['up', 'down', 'left', 'right'];
         this.selectedDirection = 'up';

         $scope.alert = '';

         $scope.showGridBottomSheet = function() {
           $scope.alert = '';
           $mdBottomSheet.show({
             templateUrl: '/app/assets/partials/bottom.html',
             controller: 'BottomSheetController',
             clickOutsideToClose: false,
             disableBackdrop: true,
             disableParentScroll: false
           }).then(function(clickedItem) {
             $mdToast.show(
                   $mdToast.simple()
                     .textContent(clickedItem['name'] + ' clicked!')
                     .position('top right')
                     .hideDelay(1500)
                 );
           }).catch(function(error) {
             // User clicked outside or hit escape
           });
         };

         $scope.toggleSearchbar = function() {
           $rootScope.$emit('toggleSearchbar');
         };

         $scope.uploadFile = function(ev){
           $mdDialog.show({
              templateUrl: '/app/assets/partials/dialog/uploadFile.html',
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose:true,
              fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            })
            .then(function(answer) {
              $scope.status = 'You said the information was "' + answer + '".';
            }, function() {
              $scope.status = 'You cancelled the dialog.';
            });
         };


          $scope.lockLeft = true;

          $scope.init = function() {
            	var ul = $("#navs"),
                  btn = $("#wavs"),
                  cn = $("#circle-nav-btn"),
                  li = $("#navs li"),
                  i = li.length,
                  n = i-1,
                  r = 120;

              btn.hover(function() {
                li.css("display", "block");
              });

              btn.unbind('click').click(function() {
                  cn.attr('class', 'fa fa-cog fa-2x');
                  ul.toggleClass('active');
                  if (ul.hasClass('active')){
                    for (var a = 0; a < i; a++){
                      li.eq(a).css({
                        'transition-delay':""+(50*a)+"ms",
                        '-webkit-transition-delay':""+(50*a)+"ms",
                        'right':(r*Math.cos(90/n*a*(Math.PI/180))),
                        'top':(-r*Math.sin(90/n*a*(Math.PI/180)))
                      });
                    }
                  } else {
                    li.removeAttr('style');
                    cn.attr('class', 'fa fa-cogs fa-2x');
                  }
              });


          };

          $scope.init();

          $scope.addCompound = function(){
            if (cy.$(':selected').length > 0) {
              EntityService.openSideNav('createCompound');
            } else {
              console.log('Please select one or more node to be children');
            }
          };

          $scope.centerGraph = function() {
            $rootScope.$emit('centerGraph');
          };

          $scope.layoutReset = function(){
            $rootScope.$broadcast('layoutReset');
          };

          $scope.toggleSidenav = function() {
            $rootScope.$emit('toggleMainnav');
            // if (window.innerWidth > 1280) {
            //   $rootScope.$emit('toggleMainnav');
            // } else {
            //   $mdSidenav('left').toggle();
            // }
          };
        }
      ]);
});
