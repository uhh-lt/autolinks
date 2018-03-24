define([
    'angular',
    'jquery',
    'ngAnimate',
    'ngSanitize',
    'ui-bootstrap',
    'ngTouch'
], function(angular) {
    'use strict';
    /**
     * viewer module:
     */
    angular.module('autolinks.carousel', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngTouch'])
        // Viewer Controller
        .controller('CarouselController', ['$scope', '$rootScope', 'EndPointService', '$mdDialog', '$timeout', '$sce', '_',
        function ($scope, $rootScope, EndPointService, $mdDialog, $timeout, $sce, _) {

          $scope.myInterval = 5000;
          $scope.noWrapSlides = true;
          $scope.active = 0;
          $scope.isActive = false;
          $scope.pages = 0;

          $scope.slides = [];
          $scope.currIndex = 0;

          var text1 = "The leftist-populist Chavez will make his 13th visit to Cuba since taking power in 1999 to sit his personal friend, Castro. At the Latin American School of Medicine, Chavez will";

          var text2 = "Venezuelan <span style='color:red'>President</span> Hugo Chavez' visit to Cuba this weekend, to weld his alliance with President Fidel Castro's revolution, is keeping alive a socialist threat in Latin America as far as Washington is concerned.Venezuelan President Hugo Chavez' visit to Cuba this weekend, to weld his alliance with President Fidel Castro's revolution, is keeping alive a socialist threat in Latin America as far as Washington is concerned.Venezuelan President Hugo Chavez' visit to Cuba this weekend, to weld his alliance with President Fidel Castro's revolution, is keeping alive a socialist threat in Latin America as far as Washington is concerned.Venezuelan President Hugo Chavez' visit to Cuba this weekend, to weld his alliance with President Fidel Castro's revolution, is keeping alive a socialist threat in Latin America as far as Washington is concerned.";

          var text3 = "The two presidents have challenged Washington to demand the extradition of a common foe: anti-Castro militant Luis Posada Carriles. He was arrested in the United States by immigration";

          $scope.addSlide = function(text) {
            // var newWidth = 600 + $scope.slides.length + 1;
            $scope.slides.push({
              // image: '//unsplash.it/' + newWidth + '/300',
              texts: [$sce.trustAsHtml(text)],
              id: $scope.currIndex++
            });
          };

          $scope.changeSlide = function (direction) {
            var index = $scope.active;
            if (direction === 'right') {
                $scope.active = (index <= 0 ? 0 : index - 1);
                return;
            }
            if (direction ==='left') {
                $scope.active = (index >= ($scope.slides.length - 1) ? ($scope.slides.length - 1) : index + 1);
                return;
            }
        };


          $scope.randomize = function() {
            var indexes = generateIndexesArray();
            assignNewIndexesToSlides(indexes);
          };

          $scope.resetSlides = function() {
            $scope.slides = [];
            $scope.currIndex = 0;
            $scope.active = 0;
          }

          // for (var i = 0; i < 4; i++) {
          //   $scope.addSlide(sentence.properties.surface);
          // }

          $rootScope.$on('activateTextCarousel', function(event, data) {
              $scope.resetSlides();
              $scope.isActive = true;
              EndPointService.annotateText(data).then(function(response) {
                debugger;
                var anno = response.data.annotations;
                var sentences = anno.filter(a => a.type === 'Sentence');
                // $scope.pages = sentences.length;
                _.forEach(sentences, function(sentence){
                  $scope.addSlide(sentence.properties.surface);
                });
              });
          });

          // Instantiate the Bootstrap carousel
          // $('.multi-item-carousel').carousel({
          //   interval: false
          // });
          // $timeout(function() {
          //   debugger;
          //   $('.carousel-card').each(function() {
          //     // debugger;
          //     var next = $(this).next();
          //     if (!next.length) {
          //       debugger;
          //       next = $(this).siblings(':first');
          //     }
          //     debugger;
          //     next.children(':first-child').children().clone().appendTo($(this).children(':first-child'));
          //     if (!next.next().length) {
          //       debugger;
          //       next = $(this).siblings(':first');
          //     }
          //     next.next().children(':first-child').children().clone().appendTo($(this).children(':first-child'));
          //     // if (next.next().length > 0) {
          //     //   next.next().children(':first-child').children().clone().appendTo($(this).children());
          //     // } else {
          //     //   $(this).siblings(':first').children(':first-child').children().clone().appendTo($(this).children());
          //     // }
          //   });
          // });
          // for every slide in carousel, copy the next slide's item in the slide.
          // Do the same for the next, next item.


          // Randomize logic below

          function assignNewIndexesToSlides(indexes) {
            for (var i = 0, l = slides.length; i < l; i++) {
              slides[i].id = indexes.pop();
            }
          }

          function generateIndexesArray() {
            var indexes = [];
            for (var i = 0; i < currIndex; ++i) {
              indexes[i] = i;
            }
            return shuffle(indexes);
          }

          // http://stackoverflow.com/questions/962802#962890
          function shuffle(array) {
            var tmp, current, top = array.length;

            if (top) {
              while (--top) {
                current = Math.floor(Math.random() * (top + 1));
                tmp = array[current];
                array[current] = array[top];
                array[top] = tmp;
              }
            }

            return array;
          }

        }
      ]);
});
