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
    // angular.module('autolinks.input')
        // Network Controller
        .config(['$mdIconProvider', function($mdIconProvider) {
          $mdIconProvider.icon('md-close', 'img/icons/ic_close_24px.svg', 24);
        }])
        .controller('InputController', ['$scope', '$mdToast', '$mdSidenav', 'EndPointService', 'EntityService', '_',
        function ($scope, $mdToast, $mdSidenav, EndPointService, EntityService, _) {

          /* This contains the JavaScript code for the 'commafield,' which is basically
          a tag input. It just gives visual feedback that inputs were 'registered' when a
          user is inputting multiple elements. Running this script will transform all
          elements with the 'commafield' class name to comma separated input field.
          */

          // == HELPER FUNCTIONS == //

          var self = this;

          self.readonly = false;

          // Lists of fruit names and Vegetable objects
          self.chipNames = [];
          self.roChipNames = angular.copy(self.chipNames);
          self.editableChipNames = angular.copy(self.chipNames);

          $scope.listServices = EndPointService.fetchService();

          // An onclick function that removes the element clicked
          function removeThis() {
            this.parentElement.removeChild(this);
          }

          $scope.submit = function() {
            EndPointService.fetchService().then(function(response) {
              resetNetworkFromInput(response);
            });
          }

          // Reset the network with the content from the input box.
          function resetNetworkFromInput(response) {
            // Network should be reset
            var needsreset = true;
            // var cf = self.roChipNames;
            // Items entered.
            var inputs = (self.roChipNames.length > 0) ? self.roChipNames : [document.getElementsByClassName('md-input')[0].value];

            // If no input is given, prompt user to enter articles
            if (!inputs[0]) {
              // noInputDetected();
              return;
            }

            $scope.list = response.data;

            // for (var i=0; i<inputs.length; i++) {
            // if (_.includes(inputs, 'Simon')) {
            _.forEach(inputs, function(i) {
              // EndPointService.annotateText(i).then(function(response) {
                  // const annotations = response.data.annotations;
                  $scope.context = i;
                  const inputLength = i.length;
                  $scope.active = EndPointService.getActiveService();

                  if ($scope.active.length > 0) {
                    // _.forEach(annotations, function(anno) {
                      // const offsets = anno.doffset.offsets;
                      _.forEach($scope.list, function(l) {

                        $scope.serviceName = l.name;
                        $scope.serviceVersion = l.version;

                        _.forEach(l.endpoints, function(e) {
                          if (_.includes($scope.active, e.path)) {
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
                    $mdToast.show(
                          $mdToast.simple()
                            .textContent('Please select a service path first')
                            .position('top right')
                            .theme("warn-toast")
                            .hideDelay(3500)
                        );
                    $mdSidenav('left').toggle();
                  }
              // });
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
            // Turn off the placeholder
            offPlaceholder(cf);
          }

          // Remove the last item from a commafield
          function removeLast(cf) {
            var items = cf.getElementsByClassName("item");
            if (items.length) {
              var item = items[items.length-1];
              cf.removeChild(item);
            }
            // Turn the placeholder back on only if no tags are entered
            if (!getRegisteredItems(cf).length) {
              onPlaceholder(cf);
            }
          }

          // Clear all items from a commafield
          function clearItems(cf) {
            // Clear input
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

          // == Keybindings function == //
          function cfKeyDown (e) {
           e = e || window.event;

           // Check key codes
           var keycode = e.which || e.keyCode;

           switch (keycode) {
             // Comma was pressed. Insert comma if 'Alt' was held, otherwise continue
             case 188:
               if (e.altKey) {
                 e.preventDefault(); // Don't insert a '≤'
                 inp.value += ",";
                 break;
               }
               /* falls through */ // This comment exists to get JSHint to shut up
             // Comma (sans-Alt), Enter, or Tab was pressed.
             case 13:

             case 9:
               e.preventDefault(); // Stop normal action
               // Add item and clear input if anything besides whitespace was entered
               if (inp.value.trim().length &&
                   // Prevent duplicates
                   getRegisteredItems(this).indexOf(inp.value)==-1) {
                 addItem(this, inp.value.trim());
                 inp.value = "";
               }
               break;
             // Delete was pressed.
             case 8:
               // If we're at the beginning of text insertion, delete last item
               if (inp.value === "") {
                 removeLast(this);
               }
               break;
            }

          }

          // == CONVERT ALL ELEMENTS WITH APPROPRIATE CLASS == //

          var cfs = document.getElementsByClassName("commafield");

          for (var i=0; i<cfs.length; i++) {
            var cf = cfs[i];

            // Create the input box
            var input = '<input class="cfinput" placeholder="Enter Query" type="text"/>';
            cf.innerHTML = input;

            var inp = cf.getElementsByTagName("input")[0];
            // If the element specified a placeholder, display that in the input.
            // Placeholder will show only if the input is blank and there are no tags
            // entered. This is designed to mimic the way a normal input works.
            onPlaceholder(cf); // Turn placeholder on (if applicable)

            // Bind key events
            cf.onkeydown = cfKeyDown;
          }


          // == PUBLIC API (it's pretty small) == //

          // Return a list of the text in each item of an element (specified by either the node or an id)

          function getItems(cf) {
            // Get the element if a string id was provided
            if (typeof cf == "string") {
              cf = document.getElementById(cf);
            }
            var items = cf.getElementsByClassName("item");
            items = Array.prototype.slice.call(items); // Convert to array
            // Text of each item
            var itemtexts = items.map( function(i){
              return i.textContent;
            } );
            // Add the input box's text if anything is entered
            if (cf.getElementsByTagName("input")[0].value.trim().length) {
              itemtexts.push(cf.getElementsByTagName("input")[0].value);
            }
            return itemtexts;
          }


          function getRegisteredItems(cf) {
            // Get the element if a string id was provided
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
