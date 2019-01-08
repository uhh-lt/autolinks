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
        return {
            restrict: 'EA',
            template :'<div id="cy-network"></div>',
            replace: true,
            scope: {
                data: '=',
                cyData: '=',
                cyEdges: '=',
                options: '=',
                cyClick:'&',
                events: '='
            },
            link: function(scope, element, attrs, fn) {
                var networkEvents = [
                    'tap'
                ];

                var cy = null;

                panzoom(cytoscape, $);
                expandCollapse(cytoscape, $);
                undoRedo(cytoscape);
                regCose(cytoscape);
                cyqtip(cytoscape, $);
                cxtmenu(cytoscape);
                edgehandles(cytoscape);


                scope.ehListeners = [];

                // scope.$watch('data', function () { // Disable $watch for solving hidden graph bugs
                    var domContainer = document.getElementById('cy-network');
                    // graph  build
                    scope.doCy = function() {

                      // Sanity check
                      if (scope.data == null) {
                          return;
                      }

                      if (cy != null) {
                          cy.destroy();
                          cy = null;
                      }

                      for (var i=0; i<scope.cyEdges.length; i++)
                      {
                          var eSource = scope.cyEdges[i].source;
                          var eTarget = scope.cyEdges[i].target;
                          var eId = scope.cyEdges[i].id;
                          var edgeObj = {
                              data:{
                                id:eId,
                                source:eSource,
                                target:eTarget
                              }
                          };
                          scope.data.edges.push(edgeObj);
                      }

                      for (var i=0; i<scope.cyData.length; i++)
                      {
                          var dId = scope.cyData[i].id;
                          var dName = scope.cyData[i].name;
                          var dType = scope.cyData[i].type;

                          var typeColor = scope.typeColors[dType];
                          var elementObj = {
                              'data':{
                                  id:dId,
                                  name:dName,
                                  typeColor:typeColor,
                                  typeShape:dType,
                                  type:dType,

                          }};
                          scope.data.nodes.push(elementObj);
                      }

                      cy = window.cy = cytoscape({
                            container: domContainer,
                            layout: scope.options.layout,
                            style: scope.options.style,
                            elements: scope.data
                      });

                      const timestamp = Date.now();

                      var initNode = {
                          data: {
                            metadata: { label: 'Init Node' },
                            id: 'init_node' + timestamp,
                            name: 'init_node' + timestamp
                          },
                      };
                      var initNode = cy.add(initNode);

                      var edgeHandleProps = {
                        preview: false,
                        complete: function( sourceNode, targetNode, addedEles ) {
                          if (sourceNode.data && targetNode.data) {
                            var hasAncestors = _.filter(sourceNode.ancestors(), function(a) { return a.data().id === targetNode.data().id });
                            if (hasAncestors.length < 1 && targetNode.data().id !== 'annotationContainer') {
                              const after = {
                                "rid": 0,
                                "cid": 0,
                                "metadata": {},
                                "value": { "subject": { "rid": sourceNode.data().rid },
                                           "predicate": {
                                             "value": "has new relation_no_" + cy.edges().length,
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

                                      if (sourceNode.data('parent') !== targetNode.data('parent')) {

                                        var parentId = sourceNode.data().parent ? sourceNode.data().parent : null;
                                        var target = targetNode;

                                        var _jsons = target.jsons();
                                        var descs = target.descendants().jsons();
                                        var descEdges = target.descendants().connectedEdges().jsons();

                                        const timestamp = Date.now();

                                        _.forEach(_jsons, function(json) {
                                          if (json.group === 'nodes') {
                                            json.data.id = ((parentId ? parentId : '') + '__' +
                                                  ((typeof json.data.value === "string") ? json.data.value.replace(/[^A-Za-z0-9\-_]/g, '-') : json.data.rid)).replace(/\s/g, ''), // NOTE: remove metacharacters, cytoscape rule
                                            json.data.parent = parentId === null ? undefined : parentId;
                                            json.position.x = (json.position.x + sourceNode.position().x) / 2;
                                            json.position.y = (json.position.y + sourceNode.position().y) / 2;
                                          }
                                        });
                                        var existingTarget = _.filter(cy.filter('node[id = "' + parentId + '" ] ').children(), function(d) { return d.data().rid === target.data().rid });

                                        if (existingTarget === undefined || existingTarget.length === 0) {
                                          _.forEach(descs, function(desc) {
                                            var ancestor = cy.filter('node[id = "' + desc.data.parent + '" ] ').data().parent;
                                            if (desc.group === 'nodes') {
                                              desc.data.id = (parentId === null ? '' : parentId) + desc.data.parent.replace(target.data().parent, "") + desc.data.id.replace(desc.data.parent, "");
                                              desc.data.parent = (parentId === null ? '' : parentId) + desc.data.parent.replace(target.data().parent, "");
                                              desc.position.x = (desc.position.x + sourceNode.position().x) / 2;
                                              desc.position.y = (desc.position.y + sourceNode.position().y) / 2;
                                            }
                                          });

                                          _.forEach(descEdges, function(descEdge) {
                                            var chosenSource = cy.filter('node[id = "' + descEdge.data.source + '" ] ');
                                            var chosenTarget = cy.filter('node[id = "' + descEdge.data.target + '" ] ');
                                            var descEdgeSource = (parentId === null ? '' : parentId) + chosenSource.data('parent').replace(target.data().parent, "") + chosenSource.data('id').replace(chosenSource.data('parent'), "");
                                            var descEdgeTarget = (parentId === null ? '' : parentId) + chosenTarget.data('parent').replace(target.data().parent, "") + chosenTarget.data('id').replace(chosenTarget.data('parent'), "");

                                            if (descEdge.group === 'edges') {
                                              descEdge.data.id = ( descEdgeSource + '-' + descEdgeTarget + '-' + descEdge.data.rid ).replace(/\s/g, '');
                                              descEdge.data.source = descEdgeSource;
                                              descEdge.data.target = descEdgeTarget;
                                            }
                                          });

                                          var n = cy.add(_jsons.concat(descs).concat(descEdges));

                                          nodeTipExtension(n);
                                          edgeTipExtension(n.connectedEdges());

                                          addedEles.move({
                                            target: n.data('id')
                                          })
                                        } else if (existingTarget.length > 0){
                                          addedEles.move({
                                            target: existingTarget[0].data().id
                                          })
                                        }


                                      } else {
                                        var edgeObj = {
                                            data:{
                                              id: sourceNode.data('id') + targetNode.data('id'),
                                              source: sourceNode.data('id'),
                                              target: targetNode.data('id'),
                                              name: 'has relation'
                                            }
                                        };
                                      }

                                      addedEles.data('name', response.data.value.predicate.value);
                                      addedEles.data('cid', response.data.cid );
                                      addedEles.data('rid', response.data.value.predicate.rid);
                                      addedEles.data('value', response.data.value.predicate.value);
                                      addedEles.data('metadata', response.data.value.predicate.metadata );

                                      edgeTipExtension(addedEles);
                                  });
                              });
                            } else {
                              if (targetNode.data().id === 'annotationContainer') {
                                scope.$parent.$mdToast.show(
                                      scope.$parent.$mdToast.simple()
                                        .textContent('Creating edges to special container is not allowed')
                                        .position('top right')
                                        .theme("warn-toast")
                                        .hideDelay(3500)
                                    );
                              } else {
                                scope.$parent.$mdToast.show(
                                      scope.$parent.$mdToast.simple()
                                        .textContent('Creating edges to its own parents is not allowed')
                                        .position('top right')
                                        .theme("warn-toast")
                                        .hideDelay(3500)
                                    );
                              }
                              addedEles.remove();
                            }
                          }
                          eh.enabled = false;
                        },
                        stop: function( sourceNode ) {
                          eh.enabled = false;
                        }
                      }
                      var eh = cy.edgehandles(edgeHandleProps);
                      eh.enabled = false; //TODO: this line is for solving another bug which is expandCollapse bugs

                      scope.coordinate = {};
                      scope.selectedEntity = {};
                      scope.mergeMode = false;
                      scope.annotationHighlighted = null;

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

                      cy.on('tapend', 'node', function(evt) {
                        var node = evt.target;
                        var nodeLabel = node.data('metadata') && node.data('metadata').label ? node.data('metadata').label : node.data('name');

                        //NOTE: merge node scenarios
                        if (scope.mergeMode) {
                          scope.coordinate = evt.position;
                          scope.mergeToParentNodes = {target: node, source: scope.selectedNodesToMerge, children: scope.selectedNodesToMerge.children()}
                          var confirm = scope.$parent.$mdDialog.confirm()
                               .title('merge to ' + nodeLabel +'?')
                               .ok('Yes, merge!')
                               .cancel('Cancel');

                          scope.$parent.$mdDialog.show(confirm).then(function() {

                            const sourceData = scope.mergeToParentNodes.source;
                            const targetData = scope.mergeToParentNodes.target;
                            const hasChildren = scope.mergeToParentNodes.source.children().length > 0 ? true : false;

                            if (sourceData.data('rid') === targetData.data('rid')) {
                              scope.$parent.$mdToast.show(
                                    scope.$parent.$mdToast.simple()
                                      .textContent('Merging to the same node is not allowed')
                                      .position('top right')
                                      .theme("warn-toast")
                                      .hideDelay(3500)
                                  );
                            } else {
                              if (!node.isParent()) {
                                if (cy.$(':selected').length > 0) {
                                  scope.$parent.EntityService.openSideNav('createCompound');
                                } else {
                                  scope.$parent.$mdToast.show(
                                        scope.$parent.$mdToast.simple()
                                          .textContent('Please select one or more nodes to be children')
                                          .position('top right')
                                          .theme("warn-toast")
                                          .hideDelay(3500)
                                      );
                                }
                              } else {
                                const before = {
                                  "rid": sourceData.data('rid'),
                                  "cid": sourceData.data('cid'),
                                  "metadata": sourceData.data('metadata'),
                                  "value": sourceData.data('value'),
                                };

                                const after = {
                                  "rid": sourceData.data('rid'),
                                  "cid": targetData.data('rid'),
                                  "metadata": sourceData.data('metadata'),
                                  "value": sourceData.data('value'),
                                };
                                const data = { before: before, after: after };

                                scope.$parent.EndPointService.editResource(data).then(function(response) {

                                  var hasDuplicateInTarget = _.filter(targetData.children(), function(d) { return d.data().rid === sourceData.data().rid });

                                  if (hasDuplicateInTarget.length < 1) {
                                    if (sourceData.connectedEdges().length > 0) {
                                      var sourceJson = sourceData.json();
                                      sourceJson.data.id = targetData.data('id') + (sourceJson.data.parent ? sourceJson.data.id.replace(sourceJson.data.parent, "") : sourceJson.data.id);
                                      sourceJson.data.parent = targetData.data('id');
                                      sourceJson.data.cid = targetData.data('rid');
                                      sourceJson.position.x = (sourceJson.position.x + targetData.position().x) / 2;
                                      sourceJson.position.y = (sourceJson.position.y + targetData.position().y) / 3;

                                      const mvData = cy.add(sourceJson);
                                      nodeTipExtension(mvData);
                                      nodeTipExtension(mvData.descendants());
                                      edgeTipExtension(mvData.connectedEdges());
                                    } else {
                                      scope.selectedNodesToMerge.hide();
                                      sourceData.data().cid = targetData.data('rid');
                                      const mvData = sourceData.move({parent: targetData.data('id')});
                                      nodeTipExtension(mvData);
                                      nodeTipExtension(mvData.descendants());
                                      edgeTipExtension(mvData.connectedEdges());
                                    }
                                  }  else {
                                      scope.$parent.$mdToast.show(
                                            scope.$parent.$mdToast.simple()
                                              .textContent(((sourceData.data('metadata') && sourceData.data('metadata').label) ? sourceData.data('metadata').label : sourceData.data('name'))
                                              + ' is already in ' + ((targetData.data('metadata') && targetData.data('metadata').label) ? targetData.data('metadata').label : targetData.data('name')))
                                              .position('top right')
                                              .theme("warn-toast")
                                              .hideDelay(3500)
                                          );
                                    }
                                  scope.mergeMode = false;
                                });
                              }
                            }
                          }, function() {
                            scope.mergeMode = false;
                          });
                        } else {
                        }
                      });

                      cy.on('mouseover', 'node', function(e) {
                          var sel = e.target;
                          var label = (sel.data('metadata') && sel.data('metadata').label) ? sel.data('metadata').label : null;
                          var name = sel.data('name');
                          sel.addClass('hoverNode').outgoers().addClass('highlight');
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
                          if (sel.data().path === 'annotationNode' && !sel.isParent()) {
                            var anno = _.split(_.split(sel.data().name, '::')[1], ':');
                            scope.annotationHighlighted = anno[2] + '_anno_' + anno[3] + '-' + anno[4];
                            var targetHighlighted = document.getElementById(scope.annotationHighlighted);
                            if (targetHighlighted) {
                              targetHighlighted.classList.add('annotation-highlighted');
                            }
                          }
                      });

                      cy.on('mouseout', 'node', function(e) {
                          var sel = e.target;
                          cy.elements().removeClass('hoverNode').removeClass('sameLabelHighlight');
                          sel.removeClass('highlight').outgoers().removeClass('highlight');
                          sel.removeClass('highlight').incomers().removeClass('highlight');
                          var targetHighlighted = document.getElementById(scope.annotationHighlighted);
                          if (scope.annotationHighlighted && targetHighlighted) {
                            targetHighlighted.classList.remove('annotation-highlighted');
                            scope.annotationHighlighted = null;
                          }
                      });

                      cy.on('tap', 'node', function(e) {
                        var sel = e.target;
                        cy.elements().removeClass('selected');
                        sel.addClass('selected').incomers().addClass('selected');
                        sel.addClass('selected').outgoers().addClass('selected');
                      });

                      cy.on('tap', 'edge', function(e) {
                        var sel = e.target;
                        cy.elements().removeClass('selected');
                        sel.addClass('selected');
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
                                    scope.selectedEntity = n;
                                    //NOTE: annotation resources (container and nodes) are not editable and movable
                                    if (n.data('path') !== 'annotationNode') {
                                      return (
                                      '<div class="node-buttons">' +
                                      '<button id="moveNode" class="node-button"><i class="fa fa-arrows-alt fa-2x"/></button>' +
                                      '<button id="addEdge" class="node-button"><i class="fa fa-link fa-2x"/></button> ' +
                                      '<button id="editNode" class="node-button"><i class="fa fa-edit fa-2x"/></button>' +
                                      '</div>'
                                      )
                                    } else {
                                      if (!n.isParent()) {
                                        return (
                                        '<div class="node-buttons">' +
                                        '<button id="editNode" class="node-button"><i class="fa fa-edit fa-2x"/></button>' +
                                        '</div>'
                                        )
                                      }
                                    }
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
                          }
                        });
                      }

                      cy.expandCollapse({
                        layoutBy: null,
                        fisheye: false,
                        animate: false,
                        undoable: false
                      }).collapseAll();

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

                        function addNewNode(data, target, hasChildren = false) {

                          if (!target.isParent()) {
                            scope.$parent.$mdToast.show(
                                  scope.$parent.$mdToast.simple()
                                    .textContent('Creating a node inside a single node is not allowed')
                                    .position('top right')
                                    .theme("warn-toast")
                                    .hideDelay(3500)
                                );
                          } else {
                            if (hasChildren) {
                              scope.hasChildren = true;
                              scope.childrenNodes = scope.mergeToParentNodes.source.children();
                            } else {
                              scope.hasChildren = false;
                            }
                            if (target.data('rid')) {
                              scope.$parent.EndPointService.editResource(data).then(function(response) {
                                  const before = {
                                    "rid": response.data.rid,
                                    "cid": response.data.cid,
                                    "metadata": response.data.metadata,
                                    "value": response.data.value
                                  };

                                  const after = {
                                    "rid": response.data.rid,
                                    "cid": parseInt(target.data('rid') ? target.data('rid') : target.id()),
                                    "metadata": response.data.metadata,
                                    "value": response.data.value
                                  };
                                  const data = { before: before, after: after };

                                  scope.$parent.EndPointService.editResource(data).then(function(response) {
                                    if (target.isParent() || target.isNode()) {
                                      var x = scope.coordinate.x;
                                      var y = scope.coordinate.y;
                                      var data = response.data;
                                      var nodeObj = {
                                          data: {
                                            parent: target.id(),
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
                                      nodeTipExtension(n);
                                      scope.hasChildren = false;
                                    }
                                  });
                              });
                            } else {
                              if (target.isParent()) {

                                var x = scope.coordinate.x;
                                var y = scope.coordinate.y;
                                var nodeObj = {
                                    data: {
                                      parent: target.id(),
                                      id: 'n' + cy.nodes().length,
                                      name: 'new'
                                    },
                                    position: {
                                      x,
                                      y
                                    }
                                };
                                var n = cy.add(nodeObj);
                                nodeTipExtension(n);
                              }
                            }
                          }
                        }

                        cy.cxtmenu({
                          selector: 'node, edge',
                          fillColor: 'rgba(95, 239, 228, 0.84)',
                          commands: [
                            {
                              content: '<span class="fa fa-plus-circle fa-2x"></span>',
                              select: function(e){
                                const timestamp = Date.now();
                                const after = {
                                  "rid": 0,
                                  "cid": 0,
                                  "metadata": { label: "new" },
                                  "value": "new_no_" + timestamp + '_' + scope.username,
                                };
                                const data = { before: null, after: after };
                                addNewNode(data, e);
                              }
                            },

                            {
                              content: '<span class="fa fa-ban fa-2x"></span>',
                              select: function(ele){
                                console.log( 'cancel adding node' );
                              },
                              disabled: true
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
                              const timestamp = Date.now();
                              const after = {
                                "rid": 0,
                                "cid": 0,
                                "metadata": { label: "new" },
                                "value": "new_value_no_" + timestamp + '_' + scope.username,
                              };
                              const data = { before: null, after: after };
                              scope.$parent.EndPointService.editResource(data).then(function(response) {
                                var x = scope.coordinate.x;
                                var y = scope.coordinate.y;
                                var data = response.data;
                                var nodeObj = {
                                    data: {
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
                                nodeTipExtension(n);
                              });
                            }
                          },

                          {
                            content: '<span class="fa fa-ban fa-2x"></span>',
                            select: function(){
                              console.log( 'cancel adding node' );
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
                        return n.value[0];
                      }

                      function assignEntity(e, parent, child = false) {
                        if ( parent === 'outermostParentEntity' ) {
                          return {
                              id: e.rid,
                              rid: e.rid,
                              name: (typeof e.value === "string") ? e.value : e.rid,
                              metadata: e.metadata,
                              path: scope.path,
                              provenances: e.sources
                          };
                        }
                        return {
                          cid: e.cid,
                          rid: e.rid,
                          metadata: e.metadata,
                          id: ((parent ? parent.id : scope.outermostId) + '__' +
                              ((typeof e.value === "string") ? e.value.replace(/[^A-Za-z0-9\-_]/g, '-') : e.rid)).replace(/\s/g, ''), // NOTE: remove metacharacters, cytoscape rules
                          name: ((typeof e.value === "string") ? e.value : e.rid) + '',
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

                      function extractTriples(n, parent = null) {
                        let s = n.value.subject;
                        let p = n.value.predicate;
                        let o = n.value.object;

                        if (_.isArray(s.value)) {
                          var subject = assignEntity(s, parent);
                        } else if (_.isObject(s.value)) {
                          var es = extractResource(s);
                          var subject = assignEntity(es, parent);
                        } else {
                          var subject = assignEntity(s, parent, true);
                        }

                        if (_.isArray(o.value)) {
                          var object = assignEntity(o, parent);
                        } else if (_.isObject(o.value)) {
                          var eo = extractResource(o);
                          var object = assignEntity(eo, parent);
                        } else {
                          var object = assignEntity(o, parent, true);
                        }

                        if (_.isArray(p.value)) {
                          var edge = assignRelation(p, subject, object);
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
                            extractResources(n, subject);
                          });
                        } else if (_.isObject(s.value)) {
                          extractResources(s, subject);
                        };

                        if (_.isArray(o.value)) {
                          _.forEach(o.value, function(n) {
                            extractResources(n, object);
                          });
                        } else if (_.isObject(o.value)) {
                          extractResources(o, object);
                        };
                      }

                      function extractResources(n, parent = null) {
                        if (_.isArray(n.value)) {
                          if (n.value.length > 0) {
                            _.forEach(n.value, function(e) {
                              // n.value = 'parent';
                              n.value = n.rid + '';
                              var subject = assignEntity(n, parent);
                              scope.newNode.push(subject);
                              extractResources(e, subject);
                            });
                          } else {
                            n.value = 'empty';
                            var subject = assignEntity(n, parent, true);
                            scope.newNode.push(subject);
                          }
                        } else if (_.isObject(n.value)) {
                          extractTriples(n, parent);
                        } else {
                          var subject = assignEntity(n, parent, true);
                          scope.newNode.push(subject);
                        }
                      };

                      $rootScope.$on('addEntity', function(event, res) {
                        var entity = res.entity;
                        scope.path = res.data ? res.data.endpoint.path : [];
                        scope.newNode = [];
                        scope.newEdge = [];

                        var existingGraph = cy.filter('node[id = "' + entity.rid + '" ] ');

                        if (entity) {

                          if (existingGraph.length > 0 && entity.rid !== "annotationContainer") {
                            existingGraph[0].remove();
                          }

                          if (_.isArray(entity.value)) {
                            scope.outermostId = entity.rid;
                            _.forEach(entity.value, function(n) {
                              extractResources(n);
                            });
                            var outermostEntity = assignEntity(entity, 'outermostParentEntity');
                          } else if (_.isObject(entity.value)) {
                            scope.outermostId = entity.rid;
                            extractResources(entity);
                            var outermostEntity = assignEntity(entity, 'outermostParentEntity');
                          } else if (typeof entity.value === "string") {
                            var outermostEntity = assignEntity(entity, 'outermostParentEntity');
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

                          cy.layout(scope.options.layout).run();
                        }
                        $rootScope.$emit('switchNodesBasedOnTypes');
                        $rootScope.$emit('deactivateProgressBar');
                      });

                      if (!$rootScope.$$listenerCount.addEdge) {
                        if ($rootScope.$$listenerCount.addEdge === 1) {
                          $rootScope.$$listenerCount.addEdge = 0;
                          return;
                        } else {
                          $rootScope.$on('addEdge', function(e) {
                            eh.enabled = true;
                            var nodeId = scope.selectedEntity.data('id');
                            if (eh.listeners.length === 0) {
                              eh.addCytoscapeListeners();
                            }
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
                        scope.newCompoundLabel = angular.element('#newCompound').val();
                        const timestamp = Date.now();
                        const after = {
                          "rid": 0,
                          "cid": 0,
                          "metadata": { "label": scope.newCompoundLabel },
                          "value": []
                        };

                        if (scope.mergeMode) {
                          const sourceData = scope.mergeToParentNodes.source;
                          const targetData = scope.mergeToParentNodes.target;
                          const hasChildren = scope.mergeToParentNodes.source.children().length > 0 ? true : false;

                          after.value.push({"rid": sourceData.data('rid')});
                          after.value.push({"rid": targetData.data('rid')});

                          const data = { before: null, after: after };
                          scope.$parent.EndPointService.editResource(data).then(function(response) {

                            const beforeCompound = {
                              "rid": response.data.rid,
                              "cid": response.data.cid,
                              "metadata": response.data.metadata,
                              "value": response.data.value
                            };

                            const afterCompound = {
                              "rid": response.data.rid,
                              "cid": targetData.data('cid'),
                              "metadata": response.data.metadata,
                              "value": response.data.value
                            };
                            const dataCompound = { before: beforeCompound, after: afterCompound };

                            scope.$parent.EndPointService.editResource(dataCompound).then(function(response) {
                              var parentId = targetData.data().parent ? targetData.data().parent : null;

                              var x = scope.coordinate.x;
                              var y = scope.coordinate.y;
                              var data = response.data;
                              var nodeObj = {
                                  data: {
                                    cid: data.cid,
                                    rid: data.rid,
                                    metadata: data.metadata,
                                    id: ((parentId ? parentId : '') + '__' +
                                        ((typeof data.value === "string") ? data.value.replace(/[^A-Za-z0-9\-_]/g, '-') : data.rid)).replace(/\s/g, ''), // NOTE: remove metacharacters, cytoscape rules
                                    name: scope.newCompoundLabel + '_' + scope.username,
                                    value: data.value
                                  },
                                  position: {
                                    x,
                                    y
                                  }
                              };


                              var existingCompound = _.filter(cy.filter('node[id = "' + parentId + '" ] ').children(), function(d) { return d.data().rid === data.rid });
                              if (existingCompound === undefined || existingCompound.length === 0) {
                                var newCompound = cy.add(nodeObj);

                                newCompound.data().cid = targetData.data('cid');
                                const mvDataCompound = newCompound.move({parent: targetData.data('parent')});
                                nodeTipExtension(mvDataCompound);

                                const beforeTarget = {
                                  "rid": targetData.data('rid'),
                                  "cid": targetData.data('cid'),
                                  "metadata": targetData.data('metadata'),
                                  "value": targetData.data('value')
                                };

                                const afterTarget = {
                                  "rid": targetData.data('rid'),
                                  "cid": newCompound.data('rid'),
                                  "metadata": targetData.data('metadata'),
                                  "value": targetData.data('value')
                                };
                                const dataTarget = { before: beforeTarget, after: afterTarget };

                                scope.$parent.EndPointService.editResource(dataTarget).then(function(response) {
                                  if (targetData.connectedEdges().length > 0) {
                                    var targetJson = targetData.json();
                                    targetJson.data.id = newCompound.data('id') + (targetJson.data.parent ? targetJson.data.id.replace(targetJson.data.parent, "") : targetJson.data.id);
                                    targetJson.data.parent = newCompound.data('id');
                                    targetJson.data.cid = newCompound.data('rid');
                                    targetJson.position.x = ((targetJson.position.x * 2) + sourceData.position().x) / 2;
                                    targetJson.position.y = ((targetJson.position.y * 2) + sourceData.position().y) / 3;
                                    var newTarget = cy.add(targetJson);
                                    nodeTipExtension(newTarget);
                                  } else {
                                    targetData.data().cid = newCompound.data('rid');
                                    const mvDataTarget = targetData.move({parent: newCompound.data('id')});
                                    nodeTipExtension(mvDataTarget);
                                    nodeTipExtension(mvDataTarget.descendants());
                                    edgeTipExtension(mvDataTarget.connectedEdges());
                                  }

                                  const beforeSource = {
                                    "rid": sourceData.data('rid'),
                                    "cid": sourceData.data('cid'),
                                    "metadata": sourceData.data('metadata'),
                                    "value": sourceData.data('value')
                                  };

                                  const afterSource = {
                                    "rid": sourceData.data('rid'),
                                    "cid": newCompound.data('rid'),
                                    "metadata": sourceData.data('metadata'),
                                    "value": sourceData.data('value')
                                  };
                                  const dataSource = { before: beforeSource, after: afterSource };

                                  scope.$parent.EndPointService.editResource(dataSource).then(function(response) {

                                    if (sourceData.connectedEdges().length > 0) {
                                      var sourceJson = sourceData.json();
                                      sourceJson.data.id = newCompound.data('id') + (sourceJson.data.parent ? sourceJson.data.id.replace(sourceJson.data.parent, "") : sourceJson.data.id);
                                      sourceJson.data.parent = newCompound.data('id');
                                      sourceJson.data.cid = newCompound.data('rid');
                                      sourceJson.position.x = ((sourceJson.position.x * 2) + targetData.position().x) / 3;
                                      sourceJson.position.y = ((sourceJson.position.y * 2)+ targetData.position().y) / 3;
                                      var newTarget = cy.add(sourceJson);
                                      nodeTipExtension(newTarget);
                                      edgeTipExtension(newTarget.connectedEdges());
                                    } else {
                                      sourceData.data().cid = newCompound.data('rid');
                                      const mvDataSource = sourceData.move({parent: newCompound.data('id')});
                                      nodeTipExtension(mvDataSource);
                                      nodeTipExtension(mvDataSource.descendants());
                                      edgeTipExtension(mvDataSource.connectedEdges());
                                    }
                                  });

                                });

                              } else {
                                scope.$parent.$mdToast.show(
                                      scope.$parent.$mdToast.simple()
                                        .textContent('A compound with nodes '
                                        + (targetData.data('metadata') && sourceData.data('metadata').label ? sourceData.data('metadata').label : sourceData.data('name')) + ' and '
                                        + (targetData.data('metadata') && targetData.data('metadata').label ? targetData.data('metadata').label : targetData.data('name'))
                                        + ' already exist')
                                        .position('top right')
                                        .theme("warn-toast")
                                        .hideDelay(3500)
                                    );
                              }

                            });
                          });
                          scope.mergeMode = false;
                        } else {

                          var ns = cy.$(':selected');
                          _.forEach(ns, function(n) {
                            after.value.push({"rid": n.data('rid')});
                          });
                          const data = { before: null, after: after };
                          scope.$parent.EndPointService.editResource(data).then(function(response) {
                            var x = scope.coordinate.x;
                            var y = scope.coordinate.y;
                            var data = response.data;
                            var nodeObj = {
                                data: {
                                  cid: data.cid,
                                  rid: data.rid,
                                  metadata: data.metadata,
                                  id: ( scope.newCompoundLabel + ( '_as_parent_' ) + data.rid + '-' + data.cid + '_' + scope.username + timestamp  ).replace(/\s/g, ''),
                                  name: scope.newCompoundLabel + '_' + scope.username,
                                  value: data.value
                                },
                                position: {
                                  x,
                                  y
                                }
                            };

                            if (cy.hasElementWithId(nodeObj.data.id)) {
                              scope.$parent.$mdToast.show(
                                    scope.$parent.$mdToast.simple()
                                      .textContent('You have already created a compound with id' + nodeObj.data.id)
                                      .position('top right')
                                      .theme("warn-toast")
                                      .hideDelay(3500)
                                  );
                            } else {
                              scope.newCompound = cy.add(nodeObj);

                              var ns = cy.$(':selected');

                              _.forEach(ns, function(n) {

                                if (n.data().parent) {
                                  var parentId = scope.newCompound.data('id');
                                  var _jsons = n.jsons();
                                  var descs = n.descendants().jsons();
                                  var descEdges = n.descendants().connectedEdges().jsons();

                                  const timestamp = Date.now();

                                  _.forEach(_jsons, function(json) {
                                    if (json.group === 'nodes') {
                                      json.data.id = (parentId === null ? 'null_' : parentId) + json.data.id;
                                      json.data.parent = parentId === null ? undefined : parentId;
                                      json.position.x = (json.position.x) * 9 / 10;
                                      json.position.y = (json.position.y) * 9 / 10;
                                    }
                                  });

                                  if (!cy.hasElementWithId(_jsons[0].data.id)) {
                                    _.forEach(descs, function(desc) {
                                      if (desc.group === 'nodes') {
                                        desc.data.id = (parentId === null ? 'null_' : parentId) + desc.data.id;
                                        desc.data.parent = (parentId === null ? 'null_' : parentId) + desc.data.parent;
                                        desc.position.x = (desc.position.x) * 9 / 10;
                                        desc.position.y = (desc.position.y) * 9 / 10;
                                      }
                                    });

                                    _.forEach(descEdges, function(descEdge) {
                                      if (descEdge.group === 'edges') {
                                        descEdge.data.id = (parentId === null ? 'null_' : parentId) + descEdge.data.id;
                                        descEdge.data.source = (parentId === null ? 'null_' : parentId) + descEdge.data.source;
                                        descEdge.data.target = (parentId === null ? 'null_' : parentId) + descEdge.data.target;
                                      }
                                    });
                                    var n = cy.add(_jsons.concat(descs).concat(descEdges));
                                    nodeTipExtension(n);
                                  }

                                } else {
                                  n.data().parent = scope.newCompound.data('id');
                                }
                              });
                            }
                          });
                        }
                        var tempCy = cy.elements();
                        cy.elements().remove();
                        cy.add(tempCy);

                        cy.nodes().forEach(function(n){
                          nodeTipExtension(n);
                        });
                        cy.edges().forEach(function(e) {
                          edgeTipExtension(e);
                        });
                        cy.fit();

                      });

                      $rootScope.$on('createNode', function(event, newName) {
                        var nodeObj = {
                            data: {
                              id: 'n' + cy.nodes().length,
                              name: newName.name,
                              metadata: { label: newName.name }
                            },
                            position: {
                              x: 100 + Math.random() * 100,
                              y: 100 + Math.random() * 100
                            }
                        };
                        var n = cy.add(nodeObj);
                        nodeTipExtension(n);
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

                      $rootScope.$on('mergeToParent', function() {
                          scope.selectedNodesToMerge = cy.$(':selected');
                          // var descendants = selectedNodesToParent.descendants();
                          if (!scope.mergeMode) {
                            scope.mergeMode = true;
                          } else {

                          }
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

                          if (!$rootScope.selectedDoc.did) {
                            ele.show();
                          }
                        });
                      });

                      initNode.remove();
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

                  scope.$parent.EndPointService.getUsername().then(function(response) {
                    scope.username = response.data;
                  });

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
                    $rootScope.$emit('addEdge');
                  });

                  $(document).on('click', "#moveNode", function(event, n){
                    // scope.$parent.EntityService.openSideNav(scope.selectedEntity);
                    if (cy.$(':selected').length > 0) {
                      scope.$parent.$mdToast.show(
                            scope.$parent.$mdToast.simple()
                              .textContent('Please select the target node to merge')
                              .position('top right')
                              .theme("primary-toast")
                              .hideDelay(3500)
                          );
                      $rootScope.$emit('mergeToParent');
                    }
                  });
                // });
            }
        };
    });
});
