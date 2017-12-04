define([
    'angular',
    'jquery',
    'cola',
    'cytoscape',
    'cytoscape-cola',
    'cytoscape-panzoom',
    'cytoscape-qtip',
    'cytoscape-expand-collapse',
    'cytoscape.js-undo-redo',
    'qtip2',
    'bootstrap',
], function(angular, $, cola, cytoscape, cycola, panzoom, cyqtip, expandCollapse, undoRedo, qtip2) {
    'use strict';

    angular.module('ngCy', [])

    .directive('cytoscape', function($rootScope) {
        // graph visualisation by - https://github.com/cytoscape/cytoscape.js
        return {
            restrict: 'E',
            template :'<div id="cy-network"></div>',
            replace: true,
            scope: {
                // data objects to be passed as an attributes - for nodes and edges
                cyData: '=',
                cyEdges: '=',
                // controller function to be triggered when clicking on a node
                cyClick:'&'
            },
            link: function(scope, element, attrs, fn) {
                // dictionary of colors by types. Just to show some design options
                scope.typeColors = {
                    'ellipse':'#992222',
                    'triangle':'#222299',
                    'rectangle':'#661199',
                    'roundrectangle':'#772244',
                    'pentagon':'#990088',
                    'hexagon':'#229988',
                    'heptagon':'#118844',
                    'octagon':'#335577',
                    'star':'#113355'
                };
                // debugger;

                //

                // graph  build
                scope.doCy = function(){ // will be triggered on an event broadcast
                    // initialize data object
                    scope.elements = {};
                    scope.elements.nodes = [
                      { data: { id: 'a', parent: 'b', name: "Disease" }, position: { x: 215, y: 85 } },
                      { data: { id: 'b', name: "Caucasian race" } },
                      { data: { id: 'g', parent: 'a' } },
                      { data: { id: 'h', parent: 'a' } },
                      { data: { id: 'c', parent: 'b' }, position: { x: 300, y: 85 } },
                      { data: { id: 'd', name: "Caucasian race"}, position: { x: 215, y: 175 } },
                      { data: { id: 'e' } },
                      { data: { id: 'f', parent: 'e' }, position: { x: 300, y: 175 } }
                    ];
                    scope.elements.edges = [
                      { data: { id: 'ad', source: 'd', target: 'g' } },
                      { data: { id: 'eb', source: 'e', target: 'b' } }
                    ];

                    // parse edges
                    // you can build a complete object in the controller and pass it without rebuilding it in the directive.
                    // doing it like that allows you to add options, design or what needed to the objects
                    // doing it like that is also good if your data object/s has a different structure
                    for (var i=0; i<scope.cyEdges.length; i++)
                    {
                        // get edge source
                        var eSource = scope.cyEdges[i].source;
                        // get edge target
                        var eTarget = scope.cyEdges[i].target;
                        // get edge id
                        var eId = scope.cyEdges[i].id;
                        // build the edge object
                        var edgeObj = {
                            data:{
                            id:eId,
                            source:eSource,
                            target:eTarget
                            }
                        };
                        // adding the edge object to the edges array
                        scope.elements.edges.push(edgeObj);
                    }

                    // parse data and create the Nodes array
                    // object type - is the object's group
                    for (var i=0; i<scope.cyData.length; i++)
                    {
                        // get id, name and type  from the object
                        var dId = scope.cyData[i].id;
                        var dName = scope.cyData[i].name;
                        var dType = scope.cyData[i].type;
                        // get color from the object-color dictionary
                        debugger;
                        var typeColor = scope.typeColors[dType];
                        // build the object, add or change properties as you need - just have a name and id
                        var elementObj = {
                            // group:dType,
                            'data':{
                                id:dId,
                                name:dName,
                                typeColor:typeColor,
                                typeShape:dType,
                                type:dType,

                        }};
                        // add new object to the Nodes array
                        scope.elements.nodes.push(elementObj);
                    }

                    // graph  initialization
                    // use object's properties as properties using: data(propertyName)
                    // check Cytoscapes site for much more data, options, designs etc
                    // http://cytoscape.github.io/cytoscape.js/
                    // here are just some basic options
                    // debugger;
                    panzoom(cytoscape, $);
                    expandCollapse(cytoscape, $);
                    undoRedo(cytoscape);
                    cycola(cytoscape, cola);
                    cyqtip(cytoscape, $);

                    var cy = window.cy = cytoscape({
                      container: document.getElementById('cy-network'),
                        layout: {
                            name: 'cola',
                            animate: true,
                            avoidOverlap: true, // if true, prevents overlap of node bounding boxes
                            handleDisconnected: true, // if true, avoids disconnected components from overlapping
                            fit: true, // whether to fit the viewport to the graph
                            ready: undefined, // callback on layoutready
                            stop: undefined, // callback on layoutstop
                            padding: 5 // the padding on fit
                        },
                        style: [
                           {
                            selector: 'node',
                            css: {
                                'shape': 'roundrectangle',
                                'width': '120',
                                'height': '50',

                                'background-color': 'rgba(109, 127, 227, 0.84)',
                                'content': 'data(name)',
                                'text-valign': 'center',
                                'color': 'white',
                                'text-outline-width': 2,
                                // 'text-outline-color': 'data(typeColor)'
                              }
                            },
                            {
                            selector: 'edge',
                            css:{
                                // 'width': '10',
                                'content': 'wakwaw',
                                'target-arrow-shape': 'triangle',
                                'source-arrow-shape': 'triangle'
                              }
                            },
                            {
                              selector: ':parent',
                              style: {
                                'background-opacity': 0.333
                              }
                            },
                						{
                							selector: "node.cy-expand-collapse-collapsed-node",
                							style: {
                								"background-color": "darkblue",
                								"shape": "hexagon"
                							}
                						},
                            {
                            selector: ':selected',
                            css: {
                                'background-color': 'black',
                                'line-color': 'black',
                                'target-arrow-color': 'black',
                                'source-arrow-color': 'black'
                              }
                            },
                            {
                            selector: '.faded',
                            css:
                              {
                                'opacity': 0.65,
                                'text-opacity': 0.65
                              }
                            }
                          ],
                          elements: scope.elements
                    });
                    console.log(scope.elements);
                    // ready: function(){
                    // window.cy = this;

                    // giddy up...
                    cy.elements().unselectify();

                    // var params = {
                    //   name: 'cola',
                    //   avoidOverlap: true,
                    //   nodeSpacing: 5,
                    //   edgeLengthVal: 45,
                    //   animate: true,
                    //   randomize: false,
                    //   maxSimulationTime: 1500
                    // };
                    //
                    // cy.layout( params );

                    // Event listeners
                    // with sample calling to the controller function as passed as an attribute
                    // cy.on('tap', 'node', function(e){
                    //     var evtTarget = e.cyTarget;
                    //     var nodeId = evtTarget.id();
                    //     scope.cyClick({value:nodeId});
                    // });

                    debugger;

                    cy.$('#d').qtip({
                      content: 'Hello!',
                      position: {
                        my: 'top center',
                        at: 'bottom center'
                      },
                      style: {
                        classes: 'qtip-bootstrap',
                        tip: {
                          width: 16,
                          height: 8
                        }
                      }
                    });

                    cy.expandCollapse({
                      layoutBy: {
                        name: "circle",
                        // animate: "end",
                        randomize: false,
                        fit: true
                      },
                      fisheye: false,
                      animate: false
                    });

                    // debugger;

                    // the default values of each option are outlined below:
                    var defaults = {
                      zoomFactor: 0.05, // zoom factor per zoom tick
                      zoomDelay: 45, // how many ms between zoom ticks
                      minZoom: 0.1, // min zoom level
                      maxZoom: 10, // max zoom level
                      fitPadding: 50, // padding when fitting
                      panSpeed: 10, // how many ms in between pan ticks
                      panDistance: 10, // max pan distance per tick
                      panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
                      panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
                      panInactiveArea: 8, // radius of inactive area in pan drag box
                      panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
                      zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
                      fitSelector: undefined, // selector of elements to fit
                      animateOnFit: function(){ // whether to animate on fit
                        return false;
                      },
                      fitAnimationDuration: 1000, // duration of animation on fit

                      // icon class names
                      sliderHandleIcon: 'fa fa-minus',
                      zoomInIcon: 'fa fa-plus',
                      zoomOutIcon: 'fa fa-minus',
                      resetIcon: 'fa fa-expand'
                    };

                    cy.panzoom( defaults );

                    // load the objects array
                    // use cy.add() / cy.remove() with passed data to add or remove nodes and edges without rebuilding the graph
                    // sample use can be adding a passed variable which will be broadcast on change
                    // debugger;
                    // cy.add(scope.elements);
                // }

                }; // end doCy()

                scope.doCy();


                // When the app object changed = redraw the graph
                // you can use it to pass data to be added or removed from the object without redrawing it
                // using cy.remove() / cy.add()
                $rootScope.$on('appChanged', function(){
                    scope.doCy();
                });
            }
        };
    });
});
