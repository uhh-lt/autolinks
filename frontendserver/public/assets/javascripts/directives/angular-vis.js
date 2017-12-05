define([
    'angular',
    'vis'
], function(angular, vis) {
    'use strict';

    angular.module('ngVis', [])

        .factory('VisDataSet', function () {
            'use strict';
            return function (data, options) {
                // Create the new dataSets
                return new vis.DataSet(data, options);
            };
        })
    /**
     * Directive for network chart.
     */
        .directive('visNetwork', function() {
            return {
                restrict: 'EA',
                transclude: false,
                scope: {
                    data: '=',
                    options: '=',
                    events: '='
                },
                link: function (scope, element, attr) {
                    var networkEvents = [
                        'click',
                        'doubleClick',
                        'oncontext',
                        'hold',
                        'release',
                        'selectNode',
                        'selectEdge',
                        'deselectNode',
                        'deselectEdge',
                        'dragStart',
                        'dragging',
                        'dragEnd',
                        'hoverNode',
                        'hoverEdge',
                        'blurNode',
                        'blurEdge',
                        'zoom',
                        'showPopup',
                        'hidePopup',
                        'startStabilizing',
                        'stabilizationProgress',
                        'stabilizationIterationsDone',
                        'stabilized',
                        'resize',
                        'initRedraw',
                        'beforeDrawing',
                        'afterDrawing',
                        'animationFinished',
                        'clearPopUp',
                        'cancelEdit'
                    ];

                    var network = null;

                    scope.$watch('data', function () {
                        // Sanity check
                        if (scope.data == null) {
                            return;
                        }

                        // If we've actually changed the data set, then recreate the graph
                        // We can always update the data by adding more data to the existing data set
                        if (network != null) {
                            network.destroy();
                        }

                        var manipulation = {
                          manipulation: {
                            addNode: function (data, callback) {
                              // filling in the popup DOM elements
                              document.getElementById('operation').innerHTML = "Add Node";
                              document.getElementById('node-id').value = data.id;
                              document.getElementById('node-label').value = data.label;
                              debugger;
                              // document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
                              document.getElementById('cancelButton').onclick = clearPopUp();
                              document.getElementById('network-popUp').style.display = 'block';
                            },
                            editNode: function (data, callback) {
                              // filling in the popup DOM elements
                              document.getElementById('operation').innerHTML = "Edit Node";
                              document.getElementById('node-id').value = data.id;
                              document.getElementById('node-label').value = data.label;
                              document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
                              document.getElementById('cancelButton').onclick = cancelEdit.bind(this,callback);
                              document.getElementById('network-popUp').style.display = 'block';
                            },
                            addEdge: function (data, callback) {
                              if (data.from == data.to) {
                                var r = confirm("Do you want to connect the node to itself?");
                                if (r == true) {
                                  callback(data);
                                }
                              }
                              else {
                                callback(data);
                              }
                            }
                          }
                        }

                        var options = {
                          options: scope.options,
                        }
                        console.log(element);
                        // Create the graph2d object
                        // network = new vis.Network(element[0], scope.data, scope.options);

                        function clearPopUp() {
                          debugger;
                          document.getElementById('saveButton').onclick = null;
                          document.getElementById('cancelButton').onclick = null;
                          document.getElementById('network-popUp').style.display = 'none';
                        }

                        function cancelEdit(callback) {
                          clearPopUp();
                          callback(null);
                        }

                        function saveData(data,callback) {
                          data.id = document.getElementById('node-id').value;
                          data.label = document.getElementById('node-label').value;
                          clearPopUp();
                          callback(data);
                        }


                        // Attach an event handler if defined
                        angular.forEach(scope.events, function (callback, event) {
                            if (networkEvents.indexOf(String(event)) >= 0) {
                                network.on(event, callback);
                            }
                        });

                        // onLoad callback
                        if (scope.events != null && scope.events.onload != null &&
                            angular.isFunction(scope.events.onload)) {
                            scope.events.onload(network);
                        }
                    });

                    scope.$watchCollection('options', function (options) {
                        if (network == null) {
                            return;
                        }
                        // This watch is not fired immediately! Do not rely on it and
                        // change options manually with the network that is provided
                        // in the onload callback.
                        network.setOptions(options);
                    });
                }
            };
        })

    ;
});
