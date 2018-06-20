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
          $scope.activeTypes = EndPointService.getActiveTypes();

          $scope.addSlide = function(sentence, entity) {
            // var newWidth = 600 + $scope.slides.length + 1;
            $scope.sentenceFrom = sentence.doffset.offsets[0].from;
            $scope.sentenceTo = sentence.doffset.offsets[0].from + sentence.doffset.offsets[0].length;

            var text = $scope.doc.substring($scope.sentenceFrom, $scope.sentenceTo);
            var offset = 0;
            var compiledString = "";

            entity.forEach(function(e) {
                var from = e.doffset.offsets[0].from - $scope.sentenceFrom;
                var to = (e.doffset.offsets[0].from + e.doffset.offsets[0].length) - $scope.sentenceFrom;
                var fragments = text.slice(offset, from).split('\n');
                var surface = text.substring(from, to);
                var eId = ($scope.currIndex) + '_' + surface.replace(/\s/g,'') + '_' + from + ':' + to;

                fragments.forEach(function(f, i) {
                    compiledString = compiledString.concat(f);
                    if(fragments.length > 1 && i != fragments.length - 1) compiledString = compiledString.concat('<br />');
                });

                if (!isEntityInDoc($scope.entityInDoc, from, to, $scope.currIndex)) {
                  var highlightElement = undefined;

                  highlightElement = createNeHighlight(eId, surface);
                  // Append marked element to DOM
                  // var compiledElement = $compile(highlightElement)(scope);
                  compiledString = compiledString.concat(highlightElement);
                  // Move the cursor
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
              entity: entity
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
              // var color = graphProperties.options['groups'][typeId]['color']['background'];
              var color = 'blue';
              var addFilter = '<a id='+ id +' ng-click="addEntityFilter(' + id +')" context-menu="contextMenu" style="text-decoration: none; cursor: pointer" class="entityHighlight">' + name + '</a>';
              var innerElement = '<span style="padding: 0; margin: 0; text-decoration: none; border-bottom: 3px solid ' + color + ';">' + addFilter + '</span>';
              // innerElement.className = 'highlight-general';
              // addFilter.append(document.createTextNode(name));
              // innerElement.append(addFilter);
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
              $scope.selectedEntity =  $scope.getSelectionEntity(script);
              var ent = $scope.selectedEntity;
              var eId = ($scope.currIndex) + '_' + ent.text + '_' + ent.start + ':' + ent.end;
              var highlightElement = createNeHighlight(eId, ent.text);

              var newScript = replaceAt(script, ent.text, highlightElement, ent.start, ent.end);

              // var selectedDoc = $scope.tabs.find((t) => { return t.id === doc.id; });
              // var isInDoc = isEntityInDoc(selectedDoc, $scope.selectedEntity);
              if (($scope.selectedEntity.text.length) > 0 && ($scope.selectedEntity.text !== ' ')) {

                $mdDialog.show({
                   templateUrl: '/app/assets/partials/dialog/newAnnotation.html',
                   parent: angular.element(document.body),
                   // targetEvent: ev,
                   clickOutsideToClose:true,
                   fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                 })
                 .then(function(answer) {
                   // $scope.status = 'You said the information was "' + answer + '".';
                   $('#' + id + '_script-area').html(newScript);
                   $scope.slides[id].scripts = [$sce.trustAsHtml(newScript)];
                   if ($scope.doffsetAnnotation.length === 0) {
                     $scope.doffsetAnnotation = ent.text;
                   } else {
                     var doffsetAnno = [' ', ent.text]
                     $scope.doffsetAnnotation = $scope.doffsetAnnotation.concat(...doffsetAnno);
                   }
                   // Move the node creation inside prompt success
                   $rootScope.$emit('createNode', { name: $scope.doffsetAnnotation });
                   $scope.doffsetAnnotation = '';
                 }, function() {
                   $scope.status = 'You cancelled the dialog.';
                 });
                //
                // var confirm = $mdDialog.prompt()
                //    .title('Annotation Type?')
                //    .initialValue('AnatomicalSiteMention')
                //    // .targetEvent(ev)
                //    .required(true)
                //    .ok('Okay!')
                //    .cancel('Cancel');
                //
                //  $mdDialog.show(confirm).then(function(result) {
                //    // $scope.status = 'You decided to name your dog ' + result + '.';
                //    $('#' + id + '_script-area').html(newScript);
                //    $scope.slides[id].scripts = [$sce.trustAsHtml(newScript)];
                //    if ($scope.doffsetAnnotation.length === 0) {
                //      $scope.doffsetAnnotation = ent.text;
                //    } else {
                //      var doffsetAnno = [' ', ent.text]
                //      $scope.doffsetAnnotation = $scope.doffsetAnnotation.concat(...doffsetAnno);
                //    }
                //    // Move the node creation inside prompt success
                //    $rootScope.$emit('createNode', { name: $scope.doffsetAnnotation });
                //    $scope.doffsetAnnotation = '';
                //  }, function() {
                //    // $scope.status = 'You didn\'t name your dog.';
                //  });


                 /////////////////7
                // $rootScope.$emit('createNode', { name: ent.text });

              //   // $scope.isEntityInDoc = false;
              //   $scope.open($scope, script, 'static');
              // } else if (($scope.selectedEntity.text.length) > 0 && ($scope.selectedEntity.text !== ' ')){
              //   // $scope.isEntityInDoc = true;
              //   $scope.open($scope, script, 'true');
              }
          };

          document.addEventListener('keydown', (event) => {
            const keyName = event.key;

            if (keyName === 'Shift') {
              // do not alert when only Control key is pressed.
              $scope.doffsetAnnotation = '';
              return;
            }

            if (event.ctrlKey) {
              // Even though event.key is not 'Control' (i.e. 'a' is pressed),
              // event.ctrlKey may be true if Ctrl key is pressed at the time.
              // alert(`Combination of ctrlKey + ${keyName}`);
            } else {
              // alert(`Key pressed ${keyName}`);
            }
          }, false);

          document.addEventListener('keyup', (event) => {
            const keyName = event.key;

            // As the user release the Ctrl key, the key is no longer active.
            // So event.ctrlKey is false.
            if (keyName === 'Shift' && ($scope.doffsetAnnotation.length > 0)) {
              // $rootScope.$emit('createNode', { name: $scope.doffsetAnnotation });
              // $scope.doffsetAnnotation = '';
              // alert('Control key was released');
            }
          }, false);

          $scope.selectedType = '';
            var script = $scope.tabs;
            $scope.getSelectionEntity = function(script) {
              var text = "";
              var start = 0;
              var end = 0;
              if (window.getSelection) {
                 text = window.getSelection().toString();
                 start = script.match(text).index;
                 end = start + text.length;

                // TODO: global exec RegExp
                //  var regexScript = RegExp('the', 'g');
                //  var iter;
                //  while ((iter = regex1.exec(script)) !== null) {
                //     console.log(`Found ${iter.index}. Next starts at ${regexScript.lastIndex}.`);
                //   }
              } else if (document.selection && document.selection.type != "Shift") {
                 text = document.selection.createRange().text;
              }
              text = text.trim();
              return {
                text,
                start,
                end
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
                  // _.forEach(annotations, function(anno) {

                    // const offsets = anno.doffset.offsets;
                    _.forEach($scope.list, function(l) {

                      $scope.serviceName = l.name;
                      $scope.serviceVersion = l.version;

                      _.forEach(l.endpoints, function(e) {
                        if (_.includes($scope.listActive, e.path)) {
                          $scope.data = {
                            offsets:
                            {
                              // from: offsets[0].from ? offsets[0].from : 0,
                              from: 0,
                              length: inputLength
                              // length: offsets[0].length
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
                  // });
                } else {
                  // $mdToast.show(
                  //       $mdToast.simple()
                  //         .textContent('Please select a service path first')
                  //         .position('top right')
                  //         .theme("warn-toast")
                  //         .hideDelay(3500)
                  //     );
                  // $mdSidenav('left').toggle();
                }

              // });
            });
          };

          $(document).on('click', '.entityHighlight', function (e) {
              $scope.text = e.target.innerText;
              var selectedDoc = EndPointService.getSelectedDoc();
              $scope.addEntityFilter($scope.text);

              var splittedId = _.split(e.target.id, '_');
              var offsets = splittedId[splittedId.length - 1];
              offsets = _.split(offsets, ':');

              EndPointService.interpretOffset(selectedDoc.did, offsets).then(function(response) {
                var dataPath = { endpoint: { path: 'annotationNode' }}
                $rootScope.$broadcast('addEntity', { entity: response.data, data: dataPath });
                // EntityService.addEntity(response.data);
              });
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
            if (!loadType === 'refresh') {
              $scope.active = 0;
            }
            $scope.isActive = false;
            $scope.pages = 0;

            $scope.slides = [];
            $scope.entityInDoc = [];
            $scope.currIndex = 0;
            $scope.doffsetAnnotation = '';
          }

          // for (var i = 0; i < 4; i++) {
          //   $scope.addSlide(sentence.properties.surface);
          // }

          $rootScope.$on('activateCarouselFromDoc', function(event, data) {
              // $scope.resetSlides();
              // $scope.isActive = true;
              $scope.doc = data.text;
              textAnnotations(data);
          });

          $rootScope.$on('activateCarouselFromUpload', function(event, data) {
              $scope.doc = data;
              EndPointService.annotateText(data).then(function(response) {
                // $timeout( function(){
                textAnnotations(response.data);
                // }, 2000 );
              });
          });

          $rootScope.$on('refreshCarouselBasedOnType', function(event) {
              textAnnotations($scope.carouselData, 'refresh');
          });


          $rootScope.$on('navigateToDocFromSource', function(event, resp) {
              $scope.pvc = resp.pvc;
              $scope.doc = resp.data.text;
              textAnnotations(resp.data, 'source');
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
            // $scope.entity = anno.filter(a => a.type ==='NamedEntity')
            // $scope.pages = sentences.length;
            _.forEach(sentences, function(sentence){
              var entity = [];
              var length = sentence.doffset.offsets[0].length;
              // var surface = sentence.properties.surface;

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

          // Instantiate the Bootstrap carousel
          // $('.multi-item-carousel').carousel({
          //   interval: false
          // });
          // $timeout(function() {
          //   debugger;
          //   $('.carousel-card').each(function() {
          //     // debugger;$rootScope.selectedDoc
          //     var next = $(this).next();
          //     if (!next.length) {
          //       debugger;$rootScope.selectedDoc
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


         $scope.slidesViewed = [];
         $scope.slidesRemaining = [];
         //var carouselScope = element.isolateScope();

         $scope.isSlideActive = function(slide) {
          return $scope.active === slide.id;
         };

         $scope.selectSlide = function(slide) {
          return $scope.active = slide.id;
         };

         $scope.goNext = function() {
             //carouselScope.next();
             var index = $scope.active;
             $scope.active = (index >= ($scope.slides.length - 1) ? ($scope.slides.length - 1) : index + 1);
         };
         $scope.goPrev = function() {
           var index = $scope.active;
           $scope.active = (index <= 0 ? 0 : index - 1);
             //carouselScope.prev();
         };
         $scope.setActiveSlide = function(number) {
             console.log('>>>>>> : ' + number);
             if (number === '' || isNaN(number) || number < 0 || number > carouselScope.slides.length - 1) {
                 return;
             }
             var direction = ($scope.getActiveSlide(false) > number) ? 'prev' : 'next';
            // carouselScope.select(carouselScope.slides[number], direction);
         }
         $scope.getActiveSlide = function(showAlert) {
            //  var activeSlideIndex = carouselScope.slides.map(function(s) {
            //      return s.slide.active;
            //  }).indexOf(true);
            //  if(showAlert) {
            //    alert("Your Active Slide is : " + activeSlideIndex);
            //  }
            //  return activeSlideIndex;
         }

        }
      ]);
});
