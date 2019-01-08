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
     * carousel module:
     */
    angular.module('autolinks.carousel', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngTouch'])
        .controller('CarouselController', ['$scope', '$rootScope', 'EntityService', 'EndPointService', '$mdDialog', '$timeout', '$sce', '_', '$mdToast', '$mdSidenav',
        function ($scope, $rootScope, EntityService, EndPointService, $mdDialog, $timeout, $sce, _, $mdToast, $mdSidenav) {

          $scope.myInterval = 5000;
          $scope.noWrapSlides = true;
          $scope.active = 0;
          $scope.isActive = false;
          $scope.pages = 0;

          $scope.slides = [];
          $scope.entityInDoc = [];
          $scope.currIndex = 1;
          $scope.doffsetAnnotation = '';
          $scope.isDoffsets = false;
          $scope.activeTypes = EndPointService.getActiveTypes();
          $scope.newAnnotations = [];
          $scope.annotationMode = false;
          $scope.doffsetsMode = false;

          $scope.addSlide = function(sentence, entity) {
            $scope.sentenceFrom = sentence.doffset.offsets[0].from;
            $scope.sentenceTo = sentence.doffset.offsets[0].from + sentence.doffset.offsets[0].length;

            var text = $scope.doc.substring($scope.sentenceFrom, $scope.sentenceTo);
            var offset = 0;
            var compiledString = "";

            entity = _.orderBy(entity, ['doffset.offsets[0].from'], ['asc']); //ordering entities to fix fragment bug

            entity.forEach(function(e) {
                var from = e.doffset.offsets[0].from - $scope.sentenceFrom;
                var to = (e.doffset.offsets[e.doffset.offsets.length - 1].from + e.doffset.offsets[e.doffset.offsets.length - 1].length) - $scope.sentenceFrom;
                var fragments = text.slice(offset, from).split('\n');
                var surface = text.substring(from, to);

                var eId = ($rootScope.selectedDoc.did) + '_anno_' + e.doffset.offsets[0].from + '-' +
                (e.doffset.offsets[e.doffset.offsets.length - 1].from + e.doffset.offsets[e.doffset.offsets.length - 1].length);

                fragments.forEach(function(f, i) {
                    compiledString = compiledString.concat(f);
                    if(fragments.length > 1 && i != fragments.length - 1) compiledString = compiledString.concat('<br />');
                });

                if (!isEntityInDoc($scope.entityInDoc, from, to, $scope.currIndex)) {
                  var highlightElement = undefined;

                  highlightElement = createNeHighlight(eId, surface);
                  compiledString = compiledString.concat(highlightElement);
                  offset = _.has(e, 'nested') && e.nested.end > e.end ? e.nested.end : to;

                  $scope.entityInDoc.push(
                    {
                      entity: surface,
                      start: from,
                      end: to,
                      id: $scope.currIndex
                    }
                  );
                }

            });

            compiledString = compiledString.concat(text.slice(offset, text.length));

            $scope.slides.push({
              // image: '//unsplash.it/' + newWidth + '/300',
              texts:[text],
              scripts: [$sce.trustAsHtml(compiledString)],
              id: $scope.currIndex,
              entity: entity,
              start: $scope.sentenceFrom,
              end: $scope.sentenceTo
            });

            $scope.currIndex++;
          };

          function isEntityInDoc(selectedDoc, start, end, id) {
            var entities = selectedDoc.filter((e) =>
              {
                //avoids new entity contains / intersects / inside an existed entity
                if (((e.start >= start) &&
                    (e.end <= end)) ||
                    ((e.start <= start) &&
                    (e.end >= end)) ||
                    ((e.start <= start) &&
                    (e.end >= start)) ||
                    ((e.start <= end) &&
                    (e.end >= end))
                  ) {
                    if (e.id === id) {
                      return e;
                    }
                  }
              }
            );
            return entities.length > 0 ? true : false;
          }

          function createNeHighlight(id, name) {
              var color = 'blue';
              var addFilter = '<a id='+ id.replace(/\s/g,'') +' ng-click="addEntityFilter(' + id.replace(/\s/g,'') +')" context-menu="contextMenu" style="text-decoration: none; cursor: pointer" class="entityHighlight">' + name + '</a>';
              var innerElement = '<span style="padding: 0; margin: 0; text-decoration: none; border-bottom: 3px solid ' + color + ';">' + addFilter + '</span>';
              return innerElement;
          }

          function replaceAt(input, search, replace, start, end) {
        		return input.slice(0, start)
            	+ input.slice(start, end).replace(search, replace)
              + input.slice(end);
        	}

          // Enable to select Entity and activate whitelisting modal
          $scope.showSelectedEntity = function(text, script, id) {
              script = script.toString();

              $scope.annotation_text_script = $scope.getSelectionEntity(text[0], script);
              $scope.selectedEntity = $scope.annotation_text_script.annotationSlideScript;
              var actualProps = $scope.annotation_text_script.annotationSlideText;

              if ($scope.selectedEntity) {
                var ent = $scope.selectedEntity;
                var eId = ($rootScope.selectedDoc.did) + '_anno_' + actualProps.start + '-' + actualProps.end;
                var highlightElement = createNeHighlight(eId, ent.text);

                var newScript = replaceAt(script, ent.text, highlightElement, ent.start, ent.end);


                // NOTE: doffsetAnnotations
                if (($scope.selectedEntity.text.length) > 0 && ($scope.selectedEntity.text !== ' ')
                && $scope.annotationMode && $scope.doffsetsMode) {
                  $scope.isDoffsets = true;
                }

                if ($scope.annotationMode) {
                  if (!$scope.isDoffsets) {
                    $scope.doffsetAnnotation = ent.text;
                  } else {
                    if ($scope.doffsetAnnotation.length < 1) {
                      $scope.doffsetAnnotation = ent.text;
                    } else {
                      var doffsetAnno = [' ', ent.text]
                      $scope.doffsetAnnotation = $scope.doffsetAnnotation.concat(...doffsetAnno);
                      $scope.newAnnotations.push($scope.annotation_text_script.annotationSlideText);
                    }
                  }

                  $scope.newAnnotations.push($scope.annotation_text_script.annotationSlideText);
                  $rootScope.newAnnotations = { text: $scope.doffsetAnnotation, offsets: _.uniq($scope.newAnnotations)};

                }

              }
          };

          document.addEventListener('keydown', (event) => {
            const keyName = event.key;
            var mainScriptArea = document.getElementById('main-script-area');
            var mainTextArea = document.getElementById('main-text-area');

            if (mainScriptArea && mainTextArea && event.altKey) {
              mainScriptArea.style.display = "none";
              mainTextArea.style.display = "block";
              $scope.doffsetsMode = true;
              $scope.annotationMode = true;
              $scope.isAltKey = true;
            }

          }, false);

          document.addEventListener('keyup', (event) => {
            const keyName = event.key;
            var mainScriptArea = document.getElementById('main-script-area');
            var mainTextArea = document.getElementById('main-text-area');
            if ($scope.isAltKey) {

              $scope.annotationMode = true;
              if (mainScriptArea && mainTextArea) {
                mainScriptArea.style.display="block";
                mainTextArea.style.display="none";

                if (($scope.selectedEntity && $scope.selectedEntity.text.length) > 0 && ($scope.selectedEntity && $scope.selectedEntity.text !== ' ')
                && $scope.annotationMode) {

                  $mdDialog.show({
                     templateUrl: '/app/assets/partials/dialog/newAnnotation.html',
                     parent: angular.element(document.body),
                     clickOutsideToClose: false,
                     fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                   })
                   .then(function(answer) {
                     $scope.doffsetAnnotation = '';
                     $scope.newAnnotations = [];
                   }, function() {
                     $scope.doffsetAnnotation = '';
                     $scope.newAnnotations = [];
                   });
                 }
              }
            }
            $scope.isAltKey = false;
            $scope.doffsetsMode = false;
            $scope.annotationMode = false;
            $scope.newAnnotations = [];
            if (mainScriptArea && mainTextArea) {
              mainScriptArea.style.display = "block";
              mainTextArea.style.display = "none";
            }
          }, false);

          $scope.selectedType = '';
            var script = $scope.tabs;
            $scope.getSelectionEntity = function(slideText, slideScript) {
              var text = "";

              if (window.getSelection) {
                 text = window.getSelection().toString();
                 text = text.trim();
                 if (text.length > 0) {
                   if (slideScript) {
                     var start = 0;
                     var end = 0;
                     if (window.getSelection().getRangeAt(0)) {
                       start = (window.getSelection().getRangeAt(0).startOffset) ? window.getSelection().getRangeAt(0).startOffset : 0;
                       end = start + text.length;
                     } else {
                       start = (slideScript.match(text) && slideScript.match(text).index) ? slideScript.match(text).index : 0;
                       end = start + text.length;
                     }

                     var annotations = [];

                     var regexScript = RegExp(text, 'g');
                     var iter;
                     while ((iter = regexScript.exec(slideScript)) !== null) {
                        annotations.push({text, start: iter.index, end: regexScript.lastIndex});
                      }

                      var annotationSlideScript = {
                        text,
                        start,
                        end,
                        annotations
                      }
                   }

                   if (slideText) {
                     var start = 0;
                     var end = 0;
                     var annotations = [];

                     var regexScript = RegExp(text, 'g');
                     var iter;
                     var selectedSentence = _.filter($scope.slides, function(slide){ return slide.id === $scope.active});
                     var sentenceStart = selectedSentence[0].start;
                     if (window.getSelection().getRangeAt(0)) {
                       start = sentenceStart + ( window.getSelection().getRangeAt(0).startOffset ? window.getSelection().getRangeAt(0).startOffset : 0 );
                       end = start + text.length;
                     } else {
                       start = sentenceStart + ( slideText.match(text) && slideText.match(text).index ? slideText.match(text).index : 0 );
                       end = start + text.length;
                     }
                     while ((iter = regexScript.exec(slideText)) !== null) {
                        annotations.push({text, start: sentenceStart + iter.index, end: sentenceStart + regexScript.lastIndex});
                      }

                      var annotationSlideText = {
                        text,
                        start,
                        end,
                        annotations
                      }
                   }

                 }

              } else if (document.selection && document.selection.type != "Control") {
                 text = document.selection.createRange().text;
              }
              text = text.trim();
              return {
                annotationSlideText,
                annotationSlideScript
              };
            };

          $scope.addEntityFilter = function(name) {
            EndPointService.fetchService().then(function(response) {
              $scope.list = response.data;
              // EndPointService.annotateText(name).then(function(response) {
                const annotations = response.data.annotations;
                $scope.context = name;
                const inputLength = name.length;
                $scope.listActive = EndPointService.getActiveService();

                if ($scope.listActive.length > 0) {
                    _.forEach($scope.list, function(l) {

                      $scope.serviceName = l.name;
                      $scope.serviceVersion = l.version;

                      _.forEach(l.endpoints, function(e) {
                        if (_.includes($scope.listActive, e.path)) {
                          $scope.data = {
                            offsets:
                            {
                              from: 0,
                              length: inputLength
                            },
                            context: $scope.context,
                            name: $scope.serviceName,
                            version: $scope.serviceVersion,
                            endpoint: e
                          };

                          EndPointService.fetchData($scope.data).then(function(response) {
                              EntityService.addEntity(response, $scope.data);
                          });
                        };

                      });
                    });
                } else {}
            });
          };

          $(document).on('click', '.entityHighlight', function (e) {
              $scope.text = e.target.innerText;
              var selectedDoc = EndPointService.getSelectedDoc();
              $scope.addEntityFilter($scope.text);

              var splittedId = _.split(e.target.id, '_');
              var offsets = splittedId[splittedId.length - 1];
              offsets = _.split(offsets, '-');

              EndPointService.interpretOffset(selectedDoc.did, offsets).then(function(response) {});
              console.log($scope.text);
              e.preventDefault();
          });

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

          $scope.next = function () {
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

          $scope.prev = function () {
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

          $scope.resetSlides = function(loadType) {
            $scope.myInterval = 5000;
            $scope.noWrapSlides = true;
            if (loadType !== 'refresh') {
              $scope.active = 0;
            }
            $scope.isActive = false;
            $scope.pages = 0;

            $scope.slides = [];
            $scope.entityInDoc = [];
            $scope.currIndex = 0;
            $scope.doffsetAnnotation = '';
          }

          $rootScope.$on('activateCarousel', function() {
            if ($scope.slides.length > 0) {
                $scope.isActive = true;
            }
          });

          $rootScope.$on('deactivateCarousel', function() {
              $scope.isActive = false;
          });

          $rootScope.$on('deleteSlide', function() {
              $scope.slides = [];
              $scope.isActive = false;
          });

          $rootScope.$on('activateCarouselFromDoc', function(event, data) {
              $scope.doc = data.text;
              textAnnotations(data);
              var slideNumber = document.getElementById('slide-number');
              if (slideNumber && slideNumber.value) {
                slideNumber.value = $scope.active + 1;
              }
          });

          $rootScope.$on('activateCarouselFromWhitelist', function(event, data) {
              $scope.doc = data.text;
              textAnnotations(data, 'refresh');
              var slideNumber = document.getElementById('slide-number');
              if (slideNumber && slideNumber.value) {
                slideNumber.value = $scope.active + 1;
              }
          });

          $rootScope.$on('activateCarouselFromUpload', function(event, data) {
              $scope.doc = data;
              EndPointService.annotateText(data).then(function(response) {
                textAnnotations(response.data);
                var slideNumber = document.getElementById('slide-number');
                if (slideNumber && slideNumber.value) {
                  slideNumber.value = $scope.active + 1;
                }
              });
          });

          $rootScope.$on('refreshCarouselBasedOnType', function(event) {
              textAnnotations($scope.carouselData, 'refresh');
          });


          $rootScope.$on('navigateToDocFromSource', function(event, resp) {
              $scope.pvc = resp.pvc;
              $scope.doc = resp.data.text;
              textAnnotations(resp.data, 'source');
              var slideNumber = document.getElementById('slide-number');
              if (slideNumber && slideNumber.value) {
                slideNumber.value = $scope.active + 1;
              }
          });

          function textAnnotations(data, loadType = '') {
            $scope.resetSlides(loadType);
            $scope.carouselData = data;
            $scope.isActive = true;
            $scope.anno = data.annotations;
            var types = [];
            var sentences = $scope.anno.filter(a => a.type === 'Sentence');

            var setTypes = new Set($scope.anno.map(a => a.type));
            var arrTypes = Array.from(setTypes);
            _.forEach(arrTypes, function(type) {
              types.push({name: type, enabled: (_.includes($scope.activeTypes, type) ? true : false)});
            });

            $rootScope.$emit('addTypes', types);
            $rootScope.newAnnotationTypes = types;
            _.forEach(sentences, function(sentence){
              var entity = [];
              var length = sentence.doffset.offsets[0].length;

              if (length) {
                var from = sentence.doffset.offsets[0].from;
                from = from === undefined ? (sentence.doffset.offsets[0].from = 0) : from;
                length += from;
              }

              // Jumping to sentence from source
              if (loadType == 'source') {
                if ((parseInt($scope.pvc.start) >= from) &&
                    (parseInt($scope.pvc.end) <= length)
                  ) {
                    $scope.active = parseInt(sentence.properties.sentenceNumber);
                  }
              }

              _.forEach($scope.anno, function(a) {
                a.doffset.offsets[0].from = a.doffset.offsets[0].from ? a.doffset.offsets[0].from : 0;
                if ((_.includes($scope.activeTypes, a.type)) &&
                  ((a.doffset.offsets[0].from + a.doffset.offsets[0].length) <= length) &&
                  (a.doffset.offsets[0].from >= from)) {
                    entity.push(a);
                  }
              });

              $scope.addSlide(sentence, entity);
            });
          }

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


         $scope.slidesViewed = [];
         $scope.slidesRemaining = [];

         $scope.isSlideActive = function(slide) {
          return $scope.active === slide.id;
         };

         $scope.selectSlide = function(slide) {
          return $scope.active = slide.id;
         };

         $scope.goNext = function() {
             var index = $scope.active;
             $scope.active = (index >= ($scope.slides.length - 1) ? ($scope.slides.length - 1) : index + 1);
             document.getElementById('slide-number').value = '';
             document.getElementById('slide-number').value = $scope.active + 1;
         };
         $scope.goPrev = function() {
           var index = $scope.active;
           $scope.active = (index <= 0 ? 0 : index - 1);
           document.getElementById('slide-number').value = '';
           document.getElementById('slide-number').value = $scope.active + 1;
         };

         $scope.isPrevDisabled = function() {
           return ($scope.active + 1) <= 1 ? true : false;
         };

         $scope.isNextDisabled = function() {
           return ($scope.active + 1) >= $scope.slides.length ? true : false;
         };

         $scope.setSlideNumber = function() {
           var number = document.getElementById('slide-number').value;
           if (number === '' || isNaN(number) || number < 0 || number > $scope.slides.length) {
               return;
           }
           $scope.active = parseInt(number) - 1;
         };

         $scope.setActiveSlide = function(number) {
             console.log('>>>>>> : ' + number);
             if (number === '' || isNaN(number) || number < 0 || number > carouselScope.slides.length - 1) {
                 return;
             }
             var direction = ($scope.getActiveSlide(false) > number) ? 'prev' : 'next';
         }

        }
      ]);
});
