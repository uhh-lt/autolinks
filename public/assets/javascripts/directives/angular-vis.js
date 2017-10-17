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
     * TimeLine directive
     */
        .directive('visTimeline', function () {
            'use strict';
            return {
                restrict: 'EA',
                transclude: false,
                scope: {
                    data: '=',
                    options: '=',
                    events: '='
                },
                link: function (scope, element, attr) {
                    var timelineEvents = [
                        'rangechange',
                        'rangechanged',
                        'timechange',
                        'timechanged',
                        'select',
                        'doubleClick',
                        'click',
                        'contextmenu'
                    ];

                    // Declare the timeline
                    var timeline = null;

                    scope.$watch('data', function () {
                        // Sanity check
                        if (scope.data == null) {
                            return;
                        }

                        // If we've actually changed the data set, then recreate the graph
                        // We can always update the data by adding more data to the existing data set
                        if (timeline != null) {
                            timeline.destroy();
                        }

                        // Create the timeline object
                        timeline = new vis.Timeline(element[0], scope.data.items, scope.data.groups, scope.options);

                        // Attach an event handler if defined
                        angular.forEach(scope.events, function (callback, event) {
                            if (timelineEvents.indexOf(String(event)) >= 0) {
                                timeline.on(event, callback);
                            }
                        });

                        // onLoad callback
                        if (scope.events != null && scope.events.onload != null &&
                            angular.isFunction(scope.events.onload)) {
                            scope.events.onload(timeline);
                        }
                    });

                    scope.$watchCollection('options', function (options) {
                        if (timeline == null) {
                            return;
                        }
                        timeline.setOptions(options);
                    });
                }
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
                        'animationFinished'
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
                        //
                        function getNode(nodeId) {
                          var item;
                          for (var n in scope.data.nodes) {
                            var tmp = scope.data.nodes[n];
                            if (tmp.id === nodeId) {
                              item = tmp;
                              break;
                            }
                          }

                          return item;
                        }


                        function hideNode(nodeId) {
                          var item = getNode(nodeId);
                          if (item === undefined) return;

                          // Make the actual node invisible
                          item.color = {
                            border: 'RGBA(0,0,0,0)',
                            background: 'RGBA(0,0,0,0)',
                            highlight: {
                              border: 'RGBA(0,0,0,0)',
                              background: 'RGBA(0,0,0,0)'
                            },
                          }
                        }


                        function initSizes(elementId, nodeId) {
                          var element = document.getElementById(elementId);
                          var item = getNode(nodeId);
                          debugger;
                          if (item === undefined) return;

                          item.widthConstraint = element.clientWidth;
                          item.heightConstraint = element.clientHeight;
                          hideNode(nodeId);
                        }


                        function placeOverlay(elementId, nodeId) {
                          var pos = network.getPositions([nodeId]);
                          var dom_coords = network.canvasToDOM({x:pos[nodeId].x,y:pos[nodeId].y});
                          var element = document.getElementById(elementId);
                          element.style.left = '' + (dom_coords.x - element.clientWidth/2 ) + 'px';
                          element.style.top  = '' + (dom_coords.y - element.clientHeight/2) + 'px';
                        }

                        initSizes('html-node-1', 8);
                        initSizes('html-node-2', 4);
                        initSizes('html-node-3', 3);
                        // Create the graph2d object
                        network = new vis.Network(element[0], scope.data, scope.options);

                        network.on("afterDrawing", function (ctx) {
                          placeOverlay('html-node-1', 2);
                          placeOverlay('html-node-2', 4);
                          placeOverlay('html-node-3', 3);
                        });

                        var imageObj = new Image();
                        imageObj.src = 'http://www.rd.com/wp-content/uploads/sites/2/2016/02/03-train-cat-come-on-command.jpg';

                        network.on("beforeDrawing", function (ctx) {
                          // debugger;
                          var nodeId = '8';
                          var nodePosition = network.getPositions([nodeId]);

                          ctx.drawImage(imageObj, nodePosition[nodeId].x - 20, nodePosition[nodeId].y - 20, 40, 40);

                        });

                        function clusterByCid() {
                            debugger;
                            network.setData(data);
                            var clusterOptionsByData = {
                                joinCondition:function(childOptions) {
                                    return childOptions.cid == 1;
                                },
                                clusterNodeProperties: {id:'cidCluster', borderWidth:3, shape:'database'}
                            };
                            network.cluster(clusterOptionsByData);
                        }

                        // clusterByCid()


                        network.once('stabilized', function() {
                            var scaleOption = { scale : 2.0 };
                            network.moveTo(scaleOption);
                        })

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

    /**
     * Directive for graph2d.
     */
        .directive('visGraph2d', function () {
            'use strict';
            return {
                restrict: 'EA',
                transclude: false,
                scope: {
                    data: '=',
                    options: '=',
                    events: '='
                },
                link: function (scope, element, attr) {
                    var graphEvents = [
                        'rangechange',
                        'rangechanged',
                        'timechange',
                        'timechanged',
                        'finishedRedraw'
                    ];

                    // Create the chart
                    var graph = null;

                    scope.$watch('data', function () {
                        // Sanity check
                        if (scope.data == null) {
                            return;
                        }

                        // If we've actually changed the data set, then recreate the graph
                        // We can always update the data by adding more data to the existing data set
                        if (graph != null) {
                            graph.destroy();
                        }

                        // Create the graph2d object
                        graph = new vis.Graph2d(element[0], scope.data.items, scope.data.groups, scope.options);

                        // Attach an event handler if defined
                        angular.forEach(scope.events, function (callback, event) {
                            if (graphEvents.indexOf(String(event)) >= 0) {
                                graph.on(event, callback);
                            }
                        });

                        // onLoad callback
                        if (scope.events != null && scope.events.onload != null &&
                            angular.isFunction(scope.events.onload)) {
                            scope.events.onload(graph);
                        }
                    });

                    scope.$watchCollection('options', function (options) {
                        if (graph == null) {
                            return;
                        }
                        graph.setOptions(options);
                    });
                }
            };
        })
    ;
});
