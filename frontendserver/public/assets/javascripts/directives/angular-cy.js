define([
    'angular',
    'jquery',
    'cola',
    'cytoscape',
    'cytoscape-cola',
    'cytoscape-cxtmenu',
    'cytoscape-panzoom',
    'cytoscape-qtip',
    'cytoscape-expand-collapse',
    'cytoscape-edgehandles',
    'cytoscape.js-undo-redo',
    'qtip2',
    'bootstrap',
], function(angular, $, cola, cytoscape, cycola, cxtmenu, panzoom, cyqtip, expandCollapse,edgehandles, undoRedo, qtip2) {
    'use strict';

    angular.module('ngCy', [])

    .directive('cytoscape', function($rootScope) {
        // graph visualisation by - https://github.com/cytoscape/cytoscape.js
        return {
            restrict: 'EA',
            template :'<div id="cy-network"></div>',
            replace: true,
            scope: {
                // data objects to be passed as an attributes - for nodes and edges
                data: '=',
                cyData: '=',
                cyEdges: '=',
                options: '=',
                // controller function to be triggered when clicking on a node
                cyClick:'&',
                events: '='
            },
            link: function(scope, element, attrs, fn) {
                var networkEvents = [
                    'tap'
                ];
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

                var cy = null;

                panzoom(cytoscape, $);
                expandCollapse(cytoscape, $);
                undoRedo(cytoscape);
                cycola(cytoscape, cola);
                cyqtip(cytoscape, $);
                cxtmenu(cytoscape);

                scope.$watch('data', function () {

                    // Sanity check
                    if (scope.data == null) {
                        return;
                    }

                    // If we've actually changed the data set, then recreate the graph
                    // We can always update the data by adding more data to the existing data set
                    if (cy != null) {
                        cy.destroy();
                    }

                    // edgehandles(cytoscape);

                    var domContainer = document.getElementById('cy-network');
                    console.log(scope.data);
                    // graph  build
                    scope.doCy = function(){ // will be triggered on an event broadcast
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
                          scope.data.edges.push(edgeObj);
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
                          scope.data.nodes.push(elementObj);
                      }

                      cy = window.cy = cytoscape({
                            container: domContainer,
                            layout: scope.options.layout,
                            style: scope.options.style,
                            elements: scope.data
                      });

                      var edgeHandleProps = {
                        complete: function( sourceNode, targetNode, addedEles ){
                          // fired when edgehandles is done and elements are added
                          // build the edge object
                          // get edge source
                          var eSource = sourceNode._private.data.id;
                          // get edge target
                          var eTarget = targetNode._private.data.id;
                          // get edge id
                          var eId = eSource + eTarget;
                          // build the edge object
                          var edgeObj = {
                              data:{
                                id:eId,
                                source:eSource,
                                target:eTarget
                              }
                          };
                          // adding the edge object to the edges array
                          scope.data.edges.push(edgeObj);
                        },
                      }

                      if (scope.$parent.edgehandler) {
                        edgehandles(cytoscape);
                        cy.edgehandles(edgeHandleProps);
                      }


                      cy.nodes().forEach(function(n){
                        cy.style()
                          .selector('#'+ n.data('id'))
                          .css(
                            {
                            'background-image': n.data('image'),
                            'background-color': 'rgba(255, 255, 255, 0)',
                            'width': '50',
                            'height': '50'
                            }
                          ).update();
                      });

                      cy.nodes().forEach(function(n){
                        if (n.data('desc')) {
                          cy.$('#'+ n.data('id')).qtip({
                            content: n.data('desc'),
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
                        }
                      });

                      cy.expandCollapse({
                        layoutBy: {
                          name: "cola",
                          // animate: "end",
                          randomize: false,
                          fit: true
                        },
                        fisheye: false,
                        animate: false
                      });

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

                        cy.cxtmenu({
                          selector: 'node, edge',
                          fillColor: 'rgba(95, 239, 228, 0.84)',
                          commands: [
                            {
                              content: '<span class="fa fa-flash fa-2x"></span>',
                              select: function(ele){
                                console.log( ele.id() );
                              }
                            },

                            {
                              content: '<span class="fa fa-star fa-2x"></span>',
                              select: function(ele){
                                console.log( ele.data('name') );
                              },
                              disabled: true
                            },

                            {
                              content: 'Text',
                              select: function(ele){
                                console.log( ele.position() );
                              }
                            }
                          ]
                        });

                        cy.cxtmenu({
                        selector: 'core',
                        fillColor: 'rgba(95, 239, 228, 0.84)',
                        commands: [
                          {
                            content: 'function 1',
                            select: function(){
                              console.log( 'function 1' );
                            }
                          },

                          {
                            content: 'function 2',
                            select: function(){
                              console.log( 'function 2' );
                            }
                          }
                        ]
                      });

                    }; // end doCy()

                  scope.doCy();

                  // Attach an event handler if defined
                  angular.forEach(scope.events, function (callback, event) {
                      if (networkEvents.indexOf(String(event)) >= 0) {
                          cy.on(event, callback);
                      }
                  });

                  // onLoad callback
                  if (scope.events != null && scope.events.onload != null &&
                      angular.isFunction(scope.events.onload)) {
                      scope.events.onload(cy);
                  }

                  // When the app object changed = redraw the graph
                  // you can use it to pass data to be added or removed from the object without redrawing it
                  // using cy.remove() / cy.add()
                  $rootScope.$on('appChanged', function(){
                      scope.doCy();
                  });

                });

            }
        };
    });
});
