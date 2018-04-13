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
          $scope.currIndex = 0;

          var text1 = "The leftist-populist Chavez will make his 13th visit to Cuba since taking power in 1999 to sit his personal friend, Castro. At the Latin American School of Medicine, Chavez will";

          var text2 = "Venezuelan <span style='color:red'>President</span> Hugo Chavez' visit to Cuba this weekend, to weld his alliance with President Fidel Castro's revolution, is keeping alive a socialist threat in Latin America as far as Washington is concerned.Venezuelan President Hugo Chavez' visit to Cuba this weekend, to weld his alliance with President Fidel Castro's revolution, is keeping alive a socialist threat in Latin America as far as Washington is concerned.Venezuelan President Hugo Chavez' visit to Cuba this weekend, to weld his alliance with President Fidel Castro's revolution, is keeping alive a socialist threat in Latin America as far as Washington is concerned.Venezuelan President Hugo Chavez' visit to Cuba this weekend, to weld his alliance with President Fidel Castro's revolution, is keeping alive a socialist threat in Latin America as far as Washington is concerned.";

          var text3 = "The two presidents have challenged Washington to demand the extradition of a common foe: anti-Castro militant Luis Posada Carriles. He was arrested in the United States by immigration";

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
                var eId = ($scope.currIndex) + '_' + surface + '_' + from + ':' + to;

                fragments.forEach(function(f, i) {
                    compiledString = compiledString.concat(f);
                    if(fragments.length > 1 && i != fragments.length - 1) compiledString = compiledString.concat('<br />');
                });

                var highlightElement = undefined;

                highlightElement = createNeHighlight(eId, surface);
                // Append marked element to DOM
                // var compiledElement = $compile(highlightElement)(scope);
                compiledString = compiledString.concat(highlightElement);
                // Move the cursor
                offset = _.has(e, 'nested') && e.nested.end > e.end ? e.nested.end : to;
            });

            compiledString = compiledString.concat(text.slice(offset, text.length));

            $scope.slides.push({
              // image: '//unsplash.it/' + newWidth + '/300',
              texts:[text],
              scripts: [$sce.trustAsHtml(compiledString)],
              id: $scope.currIndex++,
              entity: entity
            });
          };

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
              if (($scope.selectedEntity.text.length) > 0 && ($scope.selectedEntity.text !== ' ') && (event.ctrlKey)) {
                debugger;
                $('#' + id + '_script-area').html(newScript);
                $scope.slides[id].scripts = [$sce.trustAsHtml(newScript)];
                $rootScope.$emit('createNode', { name: ent.text });

              //   // $scope.isEntityInDoc = false;
              //   $scope.open($scope, script, 'static');
              // } else if (($scope.selectedEntity.text.length) > 0 && ($scope.selectedEntity.text !== ' ')){
              //   // $scope.isEntityInDoc = true;
              //   $scope.open($scope, script, 'true');
              }
          };

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
              } else if (document.selection && document.selection.type != "Control") {
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

              EndPointService.annotateText(name).then(function(response) {
                const annotations = response.data.annotations;
                $scope.context = response.data;
                $scope.active = EndPointService.getActiveService();

                if ($scope.active.length > 0) {
                  _.forEach(annotations, function(anno) {

                    const offsets = anno.doffset.offsets;
                    _.forEach($scope.list, function(l) {

                      $scope.serviceName = l.name;
                      $scope.serviceVersion = l.version;

                      _.forEach(l.endpoints, function(e) {
                        if (_.includes($scope.active, e.path)) {
                          $scope.data = {
                            offsets:
                            {
                              from: offsets[0].from ? offsets[0].from : 0,
                              length: offsets[0].length
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
                  });
                } else {
                  $mdToast.show(
                        $mdToast.simple()
                          .textContent('Please select a service path first')
                          .position('top right')
                          .theme("warn-toast")
                          .hideDelay(3500)
                      );
                  $mdSidenav('left').toggle();
                }

              });
            });
          };

          $(document).on('click', '.entityHighlight', function (e) {
              $scope.text = e.target.innerText;
              $scope.addEntityFilter($scope.text);
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
              $scope.doc = data;
              EndPointService.annotateText(data).then(function(response) {

                $scope.anno = response.data;
                var sentences = $scope.anno.filter(a => a.type === 'Sentence');
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
                  //TODO: make it dynamic for 'NamedEntity'
                  entity = $scope.anno.filter(a => (
                    (a.type === 'AnatomicalSiteMention' || a.type === 'MedicationMention') &&
                    ((a.doffset.offsets[0].from + a.doffset.offsets[0].length) <= length) &&
                    (a.doffset.offsets[0].from >= from)
                  ));
                  $scope.addSlide(sentence, entity);
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
