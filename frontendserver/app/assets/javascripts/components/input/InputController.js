define([
    'angular',
    'ngMaterial'
], function(angular) {
    'use strict';
    /**
     * input module:
     * Input form for the text query
     */
    angular.module('autolinks.input', ['ngMaterial'])
        .controller('InputController', ['$scope', '$rootScope', '$mdToast', '$mdSidenav', 'EndPointService', 'EntityService', '_',
        function ($scope, $rootScope, $mdToast, $mdSidenav, EndPointService, EntityService, _) {

          var self = this;
          $scope.isActive = true;

          self.readonly = false;

          self.chipNames = [];
          self.roChipNames = angular.copy(self.chipNames);
          self.editableChipNames = angular.copy(self.chipNames);

          $scope.listServices = EndPointService.fetchService();

          function removeThis() {
            this.parentElement.removeChild(this);
          }

          $scope.submit = function() {
            EndPointService.fetchService().then(function(response) {
              resetNetworkFromInput(response);
            });
          }

          $rootScope.$on('toggleSearchbar', function() {
            $scope.isActive = !$scope.isActive;
          });

          // Reset the network with the content from the input box.
          function resetNetworkFromInput(response) {
            var needsreset = true;
            var inputs = (self.roChipNames.length > 0) ? self.roChipNames : [document.getElementsByClassName('md-input')[0].value];

            if (!inputs[0]) {
              $mdToast.show(
                    $mdToast.simple()
                      .textContent('No input given')
                      .position('top right')
                      .theme("warn-toast")
                      .hideDelay(3500)
                  );
              return;
            }

            $scope.list = response.data;

            _.forEach(inputs, function(i) {
              $scope.context = i;
              const inputLength = i.length;
              $scope.active = EndPointService.getActiveService();

              if ($scope.active.length > 0 || $rootScope.annotationSearch.local) {
                  if ($scope.active.length > 0) {
                    _.forEach($scope.list, function(l) {

                      $scope.serviceName = l.name;
                      $scope.serviceVersion = l.version;

                      _.forEach(l.endpoints, function(e) {
                        if (_.includes($scope.active, e.path)) {
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
                              if ($rootScope.annotationSearch.local) {
                                const annotationSearch = $rootScope.annotationSearch;
                                if (annotationSearch.local) {
                                  const context = $scope.context;
                                  EndPointService.annotationSearch(context, annotationSearch.ci).then(function(response) {
                                    if ((response === undefined) || response.data.length < 1) {
                                      $mdToast.show(
                                            $mdToast.simple()
                                              .textContent('No results found for ' + response.context + ' in annotation search')
                                              .position('top right')
                                              .theme("warn-toast")
                                              .hideDelay(3500)
                                          );
                                    }
                                  });
                                };
                              }
                          });
                        };

                      });
                    });
                  } else {
                    if ($rootScope.annotationSearch.local) {
                      const annotationSearch = $rootScope.annotationSearch;
                      if (annotationSearch.local) {
                        const context = $scope.context;
                        EndPointService.annotationSearch(context, annotationSearch.ci).then(function(response) {
                          if ((response === undefined) || response.data.length < 1 ) {
                            $mdToast.show(
                                  $mdToast.simple()
                                    .textContent('No results found for ' + response.context + ' in annotation search, select any service endpoint')
                                    .position('top right')
                                    .theme("warn-toast")
                                    .hideDelay(3500)
                                );
                              $mdSidenav('left').toggle();
                              $rootScope.$emit('openService');
                          }
                        });
                      }
                    };
                  };
              } else {
                $mdToast.show(
                      $mdToast.simple()
                        .textContent('Please select any service endpoint first')
                        .position('top right')
                        .theme("warn-toast")
                        .hideDelay(3500)
                    );
                $mdSidenav('left').toggle();
                $rootScope.$emit('openService');
              }
            });
          }


          // Add an item to an input
          function addItem(cf, itemtext) {
            var item = document.createElement("div");
            var text = document.createTextNode(itemtext);
            item.appendChild(text);
            item.className = "item";
            item.onclick = removeThis;
            cf.insertBefore(item, cf.getElementsByTagName("input")[0]);
            offPlaceholder(cf);
          }

          // Remove the last item from a commafield
          function removeLast(cf) {
            var items = cf.getElementsByClassName("item");
            if (items.length) {
              var item = items[items.length-1];
              cf.removeChild(item);
            }
            if (!getRegisteredItems(cf).length) {
              onPlaceholder(cf);
            }
          }

          // Clear all items from a commafield
          function clearItems(cf) {
            cf.getElementsByTagName("input")[0].value = "";
            while (cf.getElementsByClassName("item").length) {
              removeLast(cf);
            }
          }

          // Turn placeholder on for a commafield
          function onPlaceholder(cf) {
            if (cf.hasAttribute("data-placeholder")) {
              var inp = cf.getElementsByTagName("input")[0];
              inp.setAttribute("placeholder",cf.getAttribute("data-placeholder"));
            }
          }

          // Turn placeholder off for a commafield
          function offPlaceholder(cf) {
            if (cf.hasAttribute("data-placeholder")) {
              var inp = cf.getElementsByTagName("input")[0];
              inp.removeAttribute("placeholder");
            }
          }

          function cfKeyDown (e) {
           e = e || window.event;
           var keycode = e.which || e.keyCode;

           switch (keycode) {
             case 188:
               if (e.altKey) {
                 e.preventDefault(); // Don't insert a '≤'
                 inp.value += ",";
                 break;
               }
             case 13:

             case 9:
               e.preventDefault(); // Stop normal action
               if (inp.value.trim().length &&
                   getRegisteredItems(this).indexOf(inp.value)==-1) {
                 addItem(this, inp.value.trim());
                 inp.value = "";
               }
               break;
             case 8:
               if (inp.value === "") {
                 removeLast(this);
               }
               break;
            }

          }

          var cfs = document.getElementsByClassName("commafield");

          for (var i=0; i<cfs.length; i++) {
            var cf = cfs[i];
            var input = '<input class="cfinput" placeholder="Enter Query" type="text"/>';
            cf.innerHTML = input;
            var inp = cf.getElementsByTagName("input")[0];
            onPlaceholder(cf); // Turn placeholder on (if applicable)
            cf.onkeydown = cfKeyDown;
          }

          function getItems(cf) {
            if (typeof cf == "string") {
              cf = document.getElementById(cf);
            }
            var items = cf.getElementsByClassName("item");
            items = Array.prototype.slice.call(items); // Convert to array
            var itemtexts = items.map( function(i){
              return i.textContent;
            } );
            if (cf.getElementsByTagName("input")[0].value.trim().length) {
              itemtexts.push(cf.getElementsByTagName("input")[0].value);
            }
            return itemtexts;
          }


          function getRegisteredItems(cf) {
            if (typeof cf == "string") {
              cf = document.getElementById(cf);
            }
            var items = cf.getElementsByClassName("item");
            items = Array.prototype.slice.call(items); // Convert to array
            return items.map( function(i){
              return i.textContent;
            } );
          }


        }
      ]);
});
