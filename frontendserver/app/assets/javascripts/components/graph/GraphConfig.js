define([
    'angular'
], function(angular) {
    'use strict';

    angular.module('autolinks.graphConfig', [])
        .constant('physicOptions', {
            forceAtlas2Based: {
                gravitationalConstant: -220,
                centralGravity: 0.01,
                springConstant: 0.02,
                springLength: 510,
                damping: 0.4,
                avoidOverlap: 0
            },
            maxVelocity: 146,
            solver: 'forceAtlas2Based',
            stabilization: {
                fit: true,
                iterations: 1000
            }
        })
        // graph  initialization
        // use object's properties as properties using: data(propertyName)
        // check Cytoscapes site for much more data, options, designs etc
        // http://cytoscape.github.io/cytoscape.js/
        // here are just some basic options
        .constant('generalOptions', {
            layout: {
                name: 'cose-bilkent',
                nodeDimensionsIncludeLabels: true,
                avoidOverlap: true,
                // handleDisconnected: true
                // // number of ticks per frame; higher is faster but more jerky
                refresh: 150,
                // // Whether to fit the network view after when done
                fit: true,
                // // Padding on fit
                padding: 50,
                paddingCompound: 500,
                // // Whether to enable incremental mode
                randomize: false,
                // // Node repulsion (non overlapping) multiplier
                nodeRepulsion: 4500,
                // // Ideal (intra-graph) edge length
                idealEdgeLength: 60,
                // // Divisor to compute edge forces
                edgeElasticity: 0.60,
                // // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
                nestingFactor: 0.1,
                // // Gravity force (constant)
                gravity: 0.15,
                // // Maximum number of iterations to perform
                // numIter: 2500,
                // // Whether to tile disconnected nodes
                tile: true,
                // // Type of layout animation. The option set is {'during', 'end', false}
                animate: 'end',
                // // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
                tilingPaddingVertical: 10,
                // // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
                tilingPaddingHorizontal: 10,
                // // Gravity range (constant) for compounds
                gravityRangeCompound: 1.5,
                // // Gravity force (constant) for compounds
                gravityCompound: 2.0,
                // // Gravity range (constant)
                gravityRange: 3.8,
                // // Initial cooling factor for incremental layout
                initialEnergyOnIncremental: 0.5

                // // edgeLengthVal: 10,
                // // idealEdgeLength: function( edge ){ return 1; },
                // // // animate: true,
                // // avoidOverlap: true, // if true, prevents overlap of node bounding boxes
                // // handleDisconnected: true, // if true, avoids disconnected components from overlapping
                // // fit: true, // whether to fit the viewport to the graph
                // // ready: undefined, // callback on layoutready
                // // stop: undefined, // callback on layoutstop
                // // padding: 5 // the padding on fit

                // // webcola options
                // // infinite: false // blocks all interaction
                // randomize: false, // kose-bilkent will randomize node positions
                // refresh: 4, // fast animation
                // avoidOverlap: true,
                // edgeLength: 250, // should be at least two times the diagonal of a block, blocks are 100x60, therefore around 2*116
                // unconstrIter: 1, // unconstrained initial layout iterations
                // userConstIter: 0, // initial layout iterations with user-specified constraints - we don't have any user constraints
                // allConstIter: 1, // initial layout iterations with all constraints including non-overlap
                // infinite: false,
            },
            style: [
               {
                selector: 'node',
                css: {
                    'shape': 'ellipse',
                    'width': '35',
                    'height': '35',
                    'background-color': 'rgba(102, 127, 227, 0.84)',
                    'background-fit': 'cover',
                    'content':
                      function(e) {
                        return e.data('metadata').label ? e.data('metadata').label : e.data('name');
                      },
                    'text-valign': 'bottom',
                    'color': 'rgba(35, 35, 35, 0.84)',
                    // 'text-outline-width': 2,
                    // 'text-outline-color': 'data(typeColor)'
                  }
                },
                {
                selector: 'edge',
                css:{
                    'width': '2',
                    'content':
                      function(e) {
                        return e.data('metadata').label ? e.data('metadata').label : (e.data('name') ? e.data('name') : 'has relation');
                      },
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'color': 'rgba(35, 35, 35, 0.84)'
                  }
                },
                {
                  selector: ':parent',
                  style: {
                    'text-valign': 'top',
                    'background-opacity': 0.333,
                    'text-opacity': 0
                  }
                },
                {
                  selector: "node.cy-expand-collapse-collapsed-node",
                  style: {
                    'text-valign': 'top',
                    "background-color": "darkblue",
                    "shape": "rectangle"
                  }
                },
                {
                selector: ':selected',
                css: {
                    'border-width': 5,
                    'background-color': 'rgba(129, 227, 227, 0.84)',
                    // 'line-color': 'black',
                    // 'filter': 'grayscale(200%)',
                    // 'target-arrow-color': 'black',
                    // 'source-arrow-color': 'black',
                    'transition-property': 'background-color, line-color, target-arrow-color',
                    'transition-duration': '0.4s'
                  }
                },
                {
                selector: '.faded',
                css:
                  {
                    'opacity': 0.65,
                    'text-opacity': 0.65
                  }
                },

                // some style for the extension

                {
                  selector: '.eh-handle',
                  style: {
                    'background-color': 'red',
                    'width': 12,
                    'height': 12,
                    'shape': 'ellipse',
                    'overlay-opacity': 0,
                    'border-width': 12, // makes the handle easier to hit
                    'border-opacity': 0
                  }
                },

                {
                  selector: '.eh-hover',
                  style: {
                    'background-color': 'red'
                  }
                },

                {
                  selector: '.eh-source',
                  style: {
                    'border-width': 2,
                    'border-color': 'red'
                  }
                },

                {
                  selector: '.eh-target',
                  style: {
                    'border-width': 2,
                    'border-color': 'red'
                  }
                },

                {
                  selector: '.eh-preview, .eh-ghost-edge',
                  style: {
                    'background-color': 'red',
                    'line-color': 'red',
                    'target-arrow-color': 'red',
                    'source-arrow-color': 'red'
                  }
                }
              ]
            }
        )
        // Constants can't have dependencies. Inject 'graphProperties' and use options to obtain complete graph config
        .service('graphProperties', function(generalOptions, _) {
            // General options with additional physic configuration
            this.options = _.extend(generalOptions);
            // Network options for the static node legend
            this.legendOptions = _.extend({}, generalOptions, { interaction: { dragNodes: false, dragView: false, selectable: false, zoomView: false, hover: false, navigationButtons: false } });

            // Utility function to convert hex to rgba color codes
            this.convertHex = function(hex,opacity) {
                hex = hex.replace('#','');
                var r = parseInt(hex.substring(0,2), 16);
                var g = parseInt(hex.substring(2,4), 16);
                var b = parseInt(hex.substring(4,6), 16);

                var result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
                return result;
            }
        })
});
