define([
    'angular',
    'jquery',
    'cytoscape',
    'cytoscape-cose-bilkent',
    'cytoscape-klay',
    'cytoscape-cxtmenu',
    'cytoscape-panzoom',
    'cytoscape-qtip',
    'cytoscape-expand-collapse',
    'cytoscape-edgehandles',
    'cytoscape.js-undo-redo',
    'qtip2',
    'bootstrap',
], function(angular, $, cytoscape, regCose, klay, cxtmenu, panzoom, cyqtip, expandCollapse, edgehandles, undoRedo, qtip2) {
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

                // klay(cytoscape);
                panzoom(cytoscape, $);
                expandCollapse(cytoscape, $);
                undoRedo(cytoscape);
                regCose(cytoscape);
                // cycola(cytoscape, cola);
                cyqtip(cytoscape, $);
                cxtmenu(cytoscape);
                edgehandles(cytoscape);


                scope.ehListeners = [];

                // scope.$watch('data', function () { // Disable $watch for solving hidden graph bugs
                    var domContainer = document.getElementById('cy-network');
                    console.log(scope.data);
                    // graph  build
                    scope.doCy = function(){
                      // will be triggered on an event broadcast
                      // parse edges
                      // you can build a complete object in the controller and pass it without rebuilding it in the directive.
                      // doing it like that allows you to add options, design or what needed to the objects
                      // doing it like that is also good if your data object/s has a different structure

                      // Sanity check
                      if (scope.data == null) {
                          return;
                      }

                      // If we've actually changed the data set, then recreate the graph
                      // We can always update the data by adding more data to the existing data set
                      if (cy != null) {
                          cy.destroy();
                          cy = null;
                          // delete $rootScope.$$listeners['addEdge'];
                          // $rootScope.$destroy();
                          // debugger;
                          // cy.edgehandles().destroy();
                      }

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
                        preview: false,
                        complete: function( sourceNode, targetNode, addedEles ){
                          // fired when edgehandles is done and elements are added
                          // build the edge object
                          // get edge source
                          if (sourceNode.data && targetNode.data) {
                            // build the edge object
                            const after = {
                              "rid": 0,
                              "cid": 0,
                              "metadata": {},
                              "value": { "subject": { "rid": sourceNode.data().rid },
                                         "predicate": {
                                           "value": "has new relation_no_" + scope.data.edges.length,
                                            "metadata": { "label": "has relation" } },
                                         "object": { "rid": targetNode.data().rid }
                                       }
                            };

                            const data = { before: null, after: after };

                            scope.$parent.EndPointService.editResource(data).then(function(response) {

                                const before = {
                                  "rid": response.data.rid,
                                  "cid": response.data.cid,
                                  "metadata": response.data.metadata,
                                  "value": response.data.value
                                };

                                const after = {
                                  "rid": response.data.rid,
                                  "cid": sourceNode.data().cid,
                                  "metadata": response.data.metadata,
                                  "value": response.data.value
                                };
                                const data = { before: before, after: after };

                                scope.$parent.EndPointService.editResource(data).then(function(response) {

                                    var edgeObj = {
                                        data:{
                                          id: sourceNode.data('id') + targetNode.data('id'),
                                          source: sourceNode.data('id'),
                                          target: targetNode.data('id'),
                                          name: 'has relation'
                                        }
                                    };
                                    addedEles.data().name = 'has relation';
                                    // adding the edge object to the edges array
                                    scope.data.edges.push(edgeObj);
                                    edgeTipExtension(addedEles);
                                });
                            });
                          }
                          eh.enabled = false;
                          //this.enabled = false; TODO: Temporary commented for Steffen machine
                        }
                      }
                      var eh = cy.edgehandles(edgeHandleProps);
                      eh.enabled = false; //TODO: this line is for solving another bug which is expandCollapse bugs

                      // if (scope.$parent.edgehandler) {
                      //   eh.enabled = true;
                      //   debugger;
                      //   eh.start( cy.$('node:selected').remove() );
                      // }

                      // Event listeners
                      // with sample calling to the controller function as passed as an attribute

                      scope.coordinate = {};
                      scope.selectedEntity = {};

                      cy.on('taphold', function(e) {
                          eh.enabled = false;
                          scope.coordinate = e.position;
                      });

                      cy.nodes().forEach(function(n) {
                        if (n.data('image')) {
                          cy.style()
                            .selector('#'+ n.data('id'))
                            .css(
                              {
                              // 'shape': 'roundrectangle',
                              'background-image': n.data('image'),
                              'background-color': 'rgba(255, 255, 255, 0)',
                              'text-valign': 'bottom',
                              'width': '50',
                              'height': '50'
                              }
                            ).update();
                        }
                      });

                      cy.nodes().forEach(function(n) {
                        nodeTipExtension(n);
                      });

                      cy.edges().forEach(function(e) {
                        edgeTipExtension(e);
                      });

                      // cy.nodes().on('mouseover', function(e){
                      //     console.log("wow");
                      // });

                      // Events collection : mouseover, taphold, tapend, tap
                      cy.on('tapend', 'node', function(evt) {
                        var node = evt.target;
                        console.log( 'tapend ' + node.id() );
                        var x = scope.coordinate.x;
                        var y = scope.coordinate.y;
                        console.log(x, y);
                        // evt.neighborhood('edge').style( { 'line-color' : 'black' });
                        // evt.connectedEdges().style( { 'line-color' : 'black' });
                      });

                      cy.on('mouseover', 'node', function(e) {
                          var sel = e.target;
                          var label = (sel.data('metadata') && sel.data('metadata').label) ? sel.data('metadata').label : null;
                          var name = sel.data('name');
                          // cy.elements().difference(sel.outgoers()).not(sel).addClass('semitransp');
                          sel.addClass('hoverNode').outgoers().addClass('highlight');
                          // cy.elements().difference(sel.incomers()).not(sel).addClass('semitransp');
                          sel.incomers().addClass('highlight');
                          if (label || name) {
                            var sameLabelNodes = cy.nodes().filter(function( ele ) {
                              var eleLabel = (ele.data('metadata') && ele.data('metadata').label) ? ele.data('metadata').label: null ;
                              var eleName = ele.data('name');
                              return ((eleLabel ? eleLabel : eleName) == (label ? label : name) && ele.visible());
                            });
                            if (sameLabelNodes.length > 1) {
                              sameLabelNodes.addClass('sameLabelHighlight');
                            }
                          }
                      });

                      cy.on('mouseout', 'node', function(e) {
                          var sel = e.target;
                          // cy.elements().removeClass('semitransp');
                          cy.elements().removeClass('hoverNode').removeClass('sameLabelHighlight');
                          // cy.elements().removeClass('sameLabelHighlight');
                          sel.removeClass('highlight').outgoers().removeClass('highlight');
                          sel.removeClass('highlight').incomers().removeClass('highlight');
                          // sel.removeClass('highlight').incomers().removeClass('highlight');
                      });

                      cy.on('tap', 'node', function(e) {
                        var sel = e.target;
                        // cy.elements().difference(sel.outgoers()).not(sel).addClass('semitransp');
                        cy.elements().removeClass('selected');
                        sel.addClass('selected').incomers().addClass('selected');
                        sel.addClass('selected').outgoers().addClass('selected');
                          // sel.removeClass('highlight').incomers().removeClass('highlight');
                      });

                      cy.on('tap', 'edge', function(e) {
                        var sel = e.target;
                        // cy.elements().difference(sel.outgoers()).not(sel).addClass('semitransp');
                        cy.elements().removeClass('selected');
                        sel.addClass('selected');
                          // sel.removeClass('highlight').incomers().removeClass('highlight');
                      });


                      function edgeTipExtension(e) {
                        _.forEach(e, function(e) {
                          if (e.data('name')) {
                            cy.$('#'+ e.data('id')).qtip({
                              content: {
                                  text: function(event, api) {
                                    scope.selectedEntity = e;
                                    return (
                                    '<div class="edge-buttons">' +
                                    '<button id="editEdge" class="node-button"><i class="fa fa-edit fa-2x"/></button>' +
                                    '</div>'
                                    )
                                  }
                              },
                              position: {
                                my: 'bottom center',
                                at: 'top center'
                              },
                              style: {
                                  name: 'qtip-content'
                              }
                            });
                          }
                        });
                      }

                      function nodeTipExtension(n) {
                        _.forEach(n, function(n) {
                          if (n.isNode()) {
                            cy.$('#'+ n.data('id')).qtip({
                              content: {
                                  text: function(event, api) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    scope.selectedEntity = n;
                                    console.log(scope.selectedEntity.id());
                                    return (
                                    '<div class="node-buttons">' +
                                    '<button id="moveNode" class="node-button"><i class="fa fa-arrows-alt fa-2x"/></button>' +
                                    '<button id="addEdge" class="node-button"><i class="fa fa-link fa-2x"/></button> ' +
                                    '<button id="editNode" class="node-button"><i class="fa fa-edit fa-2x"/></button>' +
                                    '</div>'
                                    )
                                  }
                              },
                              show: {
                                event: 'directtap'
                              },
                              position: {
                                my: 'bottom center',
                                at: 'top center'
                              },
                              style: {
                                  name: 'qtip-content'
                              }
                            })
                            .on('tap', function( e ){
                              var eventIsDirect = e.target.same( this ); // don't use 2.x cyTarget

                              if( eventIsDirect ){
                                this.emit('directtap');
                              }
                            }).on('directtap', function( e ){
                              e.stopPropagation();
                            });

                            // cy.$('#'+ n.data('id')).qtip({
                            //   content: {
                            //       text: function(event, api) {
                            //         if (n.data('desc')) {
                            //           return (
                            //           '<div class="node-description">' + n.data('desc') + '</div>'
                            //           )
                            //         }
                            //       }
                            //   },
                            //   position: {
                            //     my: 'top center',
                            //     at: 'bottom center'
                            //   },
                            //   style: {
                            //     classes: 'qtip-bootstrap',
                            //     tip: {
                            //       width: 16,
                            //       height: 8
                            //     },
                            //   }
                            // });
                          }
                        });
                      }

                      cy.expandCollapse({
                        layoutBy: {
                          name: "cose-bilkent",
                          animate: true,
                          randomize: false,
                          fit: true
                        },
                        fisheye: false,
                        animate: false,
                        undoable: false
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
                          // openMenuEvents: 'tap',
                          commands: [
                            {
                              content: '<span class="fa fa-plus-circle fa-2x"></span>',
                              select: function(e){
                                const after = {
                                  "rid": 0,
                                  "cid": 0,
                                  "metadata": { label: "new" },
                                  "value": "new_no_" + scope.data.nodes.length,
                                };

                                const data = { before: null, after: after };

                                scope.$parent.EndPointService.editResource(data).then(function(response) {
                                    const before = {
                                      "rid": response.data.rid,
                                      "cid": response.data.cid,
                                      "metadata": response.data.metadata,
                                      "value": response.data.value
                                    };

                                    const after = {
                                      "rid": response.data.rid,
                                      "cid": parseInt(e.id()),
                                      "metadata": response.data.metadata,
                                      "value": response.data.value
                                    };
                                    const data = { before: before, after: after };

                                    scope.$parent.EndPointService.editResource(data).then(function(response) {
                                      if (e.isParent()) {
                                        var x = scope.coordinate.x;
                                        var y = scope.coordinate.y;
                                        var data = response.data;
                                        var nodeObj = {
                                            data: {
                                              parent: e.id(),
                                              cid: data.cid,
                                              rid: data.rid,
                                              metadata: data.metadata,
                                              id: ( data.value + ( '' ) + data.rid + data.cid ).replace(/\s/g, ''),
                                              name: data.value + ''
                                            },
                                            position: {
                                              x,
                                              y
                                            }
                                        };
                                        var n = cy.add(nodeObj);
                                        scope.data.nodes.push(nodeObj);
                                        nodeTipExtension(n);
                                        // cy.fit();
                                      }
                                    });
                                });
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
                        openMenuEvents: 'taphold',
                        commands: [
                          {
                            content: '<span class="fa fa-plus-circle fa-2x"></span>',
                            select: function(e){
                              var x = scope.coordinate.x;
                              var y = scope.coordinate.y;
                              var nodeObj = {
                                  data: {
                                    id: 'n' + scope.data.nodes.length,
                                    name: 'new'
                                  },
                                  position: {
                                    x,
                                    y
                                  }
                              };
                              var n = cy.add(nodeObj);
                              scope.data.nodes.push(nodeObj);
                              nodeTipExtension(n);
                              // cy.fit();
                            }
                          },

                          {
                            content: '<span class="fa fa-flash fa-2x"></span>',
                            select: function(){
                              console.log( 'function 2' );
                            }
                          }
                        ]
                      });

                      function extractResource(n) {
                        return n.value.subject;
                      }

                      function extractList(n) {
                        if (_.isArray(n[0].value)) {
                          return extractList(n[0].value);
                        }
                        if(_.isObject(n[0].value)) {
                          return n[0].value.subject;
                        }
                        if(_.isArray(n)) {
                          return n[0];
                        }
                        // return n[0].value;
                        return n.value[0];
                      }

                      function assignEntity(e, parent, child = false) {
                        if ( parent === 'outermostParentEntity' ) {
                          return {
                              id: e.rid,
                              name: e.rid,
                              metadata: e.metadata,
                              path: scope.path,
                              provenances: e.sources
                          };
                        }
                        return {
                          cid: e.cid,
                          rid: e.rid,
                          metadata: e.metadata,
                          id: ( e.value.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '') + ( child ? '' : '_as_parent' ) + '-' + e.rid + '-' + e.cid ).replace(/\s/g, ''),
                          name: e.value + '',
                          parent: parent ? parent.id : scope.outermostId,
                          path: scope.path,
                          provenances: e.sources
                        };
                      }

                      function assignRelation(r, subject, object) {
                        return {
                          group: "edges",
                          data:
                          {
                            cid: r.cid,
                            rid: r.rid,
                            metadata: r.metadata,
                            id: ( subject.id + '-' + object.id + '-' + r.rid ).replace(/\s/g, ''),
                            source: (subject.id).replace(/\s/g, ''),
                            target: (object.id).replace(/\s/g, ''),
                            name: r.value,
                            path: scope.path,
                            provenances: r.sources
                          }
                        };
                      }

                      function extractTripleResources(n, parent = null) {
                        let s = n.value.subject;
                        let p = n.value.predicate;
                        let o = n.value.object;

                        if (_.isArray(s.value)) {
                          var es = "";
                          if (s.value.length > 0) {
                            es = extractList(s.value);
                          } else {
                            s.value = "";
                            es = o;
                          }
                          var subject = assignEntity(es, parent);
                        } else if (_.isObject(s.value)) {
                          var es = extractResource(s);
                          var subject = assignEntity(es, parent);
                        } else {
                          var subject = assignEntity(s, parent, true);
                        }

                        if (_.isArray(o.value)) {
                          var eo = "";
                          if (o.value.length > 0) {
                            eo = extractList(o.value);
                          } else {
                            o.value = "";
                            eo = o;
                          }
                          var object = assignEntity(eo, parent);
                        } else if (_.isObject(o.value)) {
                          var eo = extractResource(o);
                          var object = assignEntity(eo, parent);
                        } else {
                          var object = assignEntity(o, parent, true);
                        }

                        if (_.isArray(p.value)) {
                          var ep = "";
                          if (p.value.length > 0) {
                            ep = extractList(p.value);
                          } else {
                            p.value = "";
                            ep = o;
                          }
                          var edge = assignRelation(ep, subject, object);
                        } else if (_.isObject(p.value)) {
                          var ep = extractResource(p);
                          var edge = assignEntity(ep, parent);
                        } else {
                          var edge = assignRelation(p, subject, object);
                        };

                        scope.newEdge.push(edge);
                        scope.newNode.push(subject, object);

                        if (_.isArray(s.value)) {
                          _.forEach(s.value, function(n) {
                            extractEntity(n, subject);
                          });
                        } else if (_.isObject(s.value)) {
                          extractEntity(s, subject);
                        };

                        if (_.isArray(o.value)) {
                          _.forEach(o.value, function(n) {
                            extractEntity(n, object);
                          });
                        } else if (_.isObject(o.value)) {
                          extractEntity(o, object);
                        };
                      }

                      function extractEntity(n, parent = null) {
                        if (_.isArray(n.value)) {
                          if (n.value.length > 0) {
                            _.forEach(n.value, function(e) {
                              n.value = 'parent';
                              var subject = assignEntity(n, parent);
                              scope.newNode.push(subject);
                              extractEntity(e, subject);
                            });
                          } else {
                            n.value = 'empty';
                            var subject = assignEntity(n, parent, true);
                            scope.newNode.push(subject);
                          }
                        } else if (_.isObject(n.value)) {
                          extractTripleResources(n, parent);
                        } else {
                          var subject = assignEntity(n, parent, true);
                          scope.newNode.push(subject);
                        }
                      };

                      $rootScope.$on('addEntity', function(event, res) {
                        var entity = res.entity;
                        var nodes = scope.data.nodes;
                        var edges = scope.data.edges;

                        scope.path = res.data ? res.data.endpoint.path : [];
                        scope.newNode = [];
                        scope.newEdge = [];

                        if (entity) {
                          if (_.isArray(entity.value)) {
                            scope.outermostId = entity.rid;
                            _.forEach(entity.value, function(n) {
                              extractEntity(n);
                            });
                            var outermostEntity = assignEntity(entity, 'outermostParentEntity');
                          } else if (_.isObject(entity.value)) {
                            scope.outermostId = entity.rid;
                            extractEntity(entity);
                            var outermostEntity = assignEntity(entity, 'outermostParentEntity');
                          } else {
                            return;
                          }

                          if (outermostEntity) {
                            scope.newNode.push(outermostEntity);
                          }

                          var filterNode = [];
                          _.forEach(_.uniqBy(scope.newNode, 'id'), function(n) {
                            filterNode.push({
                              group: 'nodes',
                              data: n,
                              position: {
                                x: 100 + Math.random() * 100,
                                y: 100 + Math.random() * 100
                              }
                            });
                          });

                          var n = cy.add(filterNode);
                          var e = cy.add(scope.newEdge);

                          nodeTipExtension(n);
                          edgeTipExtension(e);

                          scope.data.nodes = _.union(nodes, filterNode);
                          scope.data.edges = _.union(edges, scope.newEdge);
                          cy.layout(scope.options.layout).run();
                        }
                        $rootScope.$emit('switchNodesBasedOnTypes');
                      });

                      if (!$rootScope.$$listenerCount.addEdge) {
                        if ($rootScope.$$listenerCount.addEdge === 1) {
                          $rootScope.$$listenerCount.addEdge = 0;
                          return;
                        } else {
                          $rootScope.$on('addEdge', function(e) {
                            eh.enabled = true;
                            // eh.active = true;
                            var nodeId = scope.selectedEntity.data('id');
                            console.log(nodeId);
                            // debugger;
                            // console.log(eh.listeners);
                            // console.log(cy.$('#' + nodeId));
                            if (eh.listeners.length === 0) {
                              eh.addCytoscapeListeners();
                              // eh.listeners = scope.ehListeners;
                            }
                            // scope.ehListeners = eh.listeners;
                            eh.start( cy.$('#' + nodeId) );
                          });
                        }
                      }

                      $rootScope.$on('deleteEntity', function(){
                        if (cy.$(":selected").length > 0) {
                            cy.$(":selected").remove();
                        }
                      });

                      $rootScope.$on('disableEndpoint', function(event, path){
                        if (cy.elements("[path = '" + path + "']").length > 0) {
                            cy.elements("[path = '" + path + "']").remove();
                        }
                      });

                      $rootScope.$on('createCompound', function() {
                        var newCompound = angular.element('#newCompound').val();
                        var nodeObj = {
                            data: {
                              id: newCompound + '_as_parent',
                              name: newCompound
                            }
                        };
                        scope.newCompound = cy.add(nodeObj);
                        scope.data.nodes.push(nodeObj);
                        var ns = cy.$(':selected');
                        _.forEach(ns, function(n) {
                          n.data().parent = scope.newCompound.data('id');
                        });
                        cy.elements().remove();
                        cy.add(scope.data);
                        cy.nodes().forEach(function(n){
                          nodeTipExtension(n);
                        });
                        cy.edges().forEach(function(e) {
                          edgeTipExtension(e);
                        });
                        // cy.layout({name: 'cose-bilkent'}).run();
                        // cy.fit();
                      });

                      $rootScope.$on('createNode', function(event, newName) {
                        var nodeObj = {
                            data: {
                              id: 'n' + scope.data.nodes.length,
                              name: newName.name,
                              metadata: { label: newName.name }
                            },
                            position: {
                              x: 100 + Math.random() * 100,
                              y: 100 + Math.random() * 100
                            }
                        };
                        var n = cy.add(nodeObj);
                        scope.data.nodes.push(nodeObj);
                        nodeTipExtension(n);
                        // cy.layout({name: 'cose-bilkent'}).run();
                        // cy.fit();
                        // cy.zoom(2);
                      });

                      $rootScope.$on('layoutReset', function() {
                          cy.layout(scope.options.layout).run();
                      });

                      $rootScope.$on('clearAll', function() {
                          cy.nodes().remove();
                      });

                      $rootScope.$on('clearSelected', function() {
                          cy.$(':selected').remove();
                      });

                      $rootScope.$on('centerGraph', function() {
                          cy.fit();
                      });

                      $rootScope.$on('switchNodesBasedOnTypes', function() {
                        scope.activeTypes = scope.$parent.EndPointService.getActiveTypes();
                        // var nodes = cy.filter('node[path = "annotationNode"]');
                        var annotationNode = cy.nodes().filter(function( ele ) {
                          return (ele.data('path') == "annotationNode") && (!ele.isParent());
                        });

                        _.forEach(annotationNode, function(ele) {

                          if (_.some(scope.activeTypes, (type) => _.includes(ele.data('name'), type))) {
                            ele.show();
                          } else {
                            ele.hide();
                          }
                        });
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

                  $(document).on('click', "#editNode", function(event, n){
                    scope.$parent.EntityService.openSideNav(scope.selectedEntity);
                  });

                  $(document).on('click', "#editEdge", function(event, e) {
                    scope.$parent.EntityService.openSideNav(scope.selectedEntity);
                  });

                  $(document).on('click', "#addEdge", function(e){
                    $rootScope.$broadcast('addEdge');
                  });

                  $(document).on('click', "#moveNode", function(event, n){
                    scope.$parent.EntityService.openSideNav(scope.selectedEntity);
                  });


                // });

            }
        };
    });
});
