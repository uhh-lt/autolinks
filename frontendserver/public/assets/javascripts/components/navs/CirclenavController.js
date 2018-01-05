define([
    'angular',
    'jquery'
], function(angular, $) {
    'use strict';
    /**
     * Circlenav module:
     */
    angular.module('autolinks.circlenav', []);
    angular.module('autolinks.circlenav')
        // Circlenav Controller
        .controller('CirclenavController', ['$scope', '$rootScope', '$mdSidenav', 'EntityService',
        function ($scope, $rootScope, $mdSidenav, EntityService) {

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
            EntityService.openSideNav('createCompound');
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
