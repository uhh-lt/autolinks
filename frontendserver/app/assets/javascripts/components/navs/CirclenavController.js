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
        .controller('CirclenavController', ['$scope', '$rootScope', '$mdSidenav', 'EntityService',
        function ($scope, $rootScope, $mdSidenav, EntityService) {

         this.topDirections = ['left', 'up'];
         this.bottomDirections = ['down', 'right'];

         this.isOpen = false;

         this.availableModes = ['md-fling', 'md-scale'];
         this.selectedMode = 'md-fling';

         this.availableDirections = ['up', 'down', 'left', 'right'];
         this.selectedDirection = 'up';


          $scope.lockLeft = true;

          $scope.init = function() {
            	var ul = $("#navs"),
                  li = $("#navs li"),
                  i = li.length,
                  n = i-1,
                  r = 120;

            	ul.unbind('click').click(function() {
            		$(this).toggleClass('active');
            		if ($(this).hasClass('active')){
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
            if (window.innerWidth > 1280) {
              $rootScope.$emit('toggleMainnav');
            } else {
              $mdSidenav('left').toggle();
            }
          };
        }
      ]);
});
