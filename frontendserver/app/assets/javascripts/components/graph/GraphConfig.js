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
                        if (e.data('metadata')) {
                          if (e.data('metadata').label) {
                            return e.data('metadata').label;
                          }
                        }
                        return e.data('name');
                      },
                    'text-valign': 'bottom',
                    'color': 'rgba(63, 63, 63, 0.98)',
                    'border-style': 'solid', // node border, can be 'solid', 'dotted', 'dashed' or 'double'.
                    'border-width': '1px',
                    'border-color': 'black',
                  }
                },
                {
                selector: 'edge',
                css:{
                    'width': '2',
                    'content':
                      function(e) {
                        if (e.data('metadata')) {
                          if (e.data('metadata').label) {
                            return e.data('metadata').label;
                          }
                        }
                        return (e.data('name') ? e.data('name') : 'has relation');
                      },
                      'curve-style': 'bezier', /* options: bezier (curved) (default), unbundled-bezier (curved with manual control points), haystack (straight edges) */
                      'control-point-weight': 0.5, // '0': curve towards source node, '1': curve towards target node.
                    'target-arrow-shape': 'triangle',
                    'line-color': 'rgba(166, 166, 166, 0.58)',
                    'target-arrow-color': 'rgba(166, 166, 166, 0.58)',
                    'color': 'rgba(63, 63, 63, 0.98)'
                  }
                },
                {
                  selector: ':parent',
                  style: {
                    'text-valign': 'top',
                    'background-opacity': 0.333,
                    'background-color': 'rgba(230, 230, 230, 0.64)'
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
                    'border-color': 'blue',
                    'background-color': 'rgba(129, 227, 227, 0.84)',
                    'color': 'rgba(32, 32, 32, 0.98)',
                    'transition-property': 'background-color, line-color, target-arrow-color',
                    'transition-duration': '0.4s'
                  }
                },
                {
                    selector: 'node.hoverNode',
                    style: {
                        'background-opacity': 0.65,
                        'color': 'rgba(32, 32, 32, 0.98)'
                    }
                },
                {
                    selector: 'node.sameLabelHighlight',
                    style: {
                        'border-color': 'gold',
                        'border-width': '2px',
                        'border-style': 'dashed'
                    }
                },
                {
                    selector: 'node.semitransp',
                    style: {
                  }
                },
                {
                    selector: 'edge.highlight',
                    style: {
                      'line-color': 'rgba(115, 115, 115, 0.98)',
                      'target-arrow-color': 'rgba(115, 115, 115, 0.98)',
                      'color': 'rgba(32, 32, 32, 0.98)'
                    }
                },
                {
                    selector: 'edge.semitransp',
                    style:{ 'opacity': '0.8' }
                },

                {
                    selector: 'edge.selected',
                    style: {  'line-color': 'blue', 'target-arrow-color': 'blue' }
                },
                {
                selector: '.faded',
                css:
                  {
                    'opacity': 0.65,
                    'text-opacity': 0.65
                  }
                },
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
