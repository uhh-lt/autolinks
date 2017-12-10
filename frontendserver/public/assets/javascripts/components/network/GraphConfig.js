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
                animate: 'end'
                // edgeLengthVal: 10,
                // idealEdgeLength: function( edge ){ return 1; },
                // // animate: true,
                // avoidOverlap: true, // if true, prevents overlap of node bounding boxes
                // handleDisconnected: true, // if true, avoids disconnected components from overlapping
                // fit: true, // whether to fit the viewport to the graph
                // ready: undefined, // callback on layoutready
                // stop: undefined, // callback on layoutstop
                // padding: 5 // the padding on fit
            },
            style: [
               {
                selector: 'node',
                css: {
                    'shape': 'roundrectangle',
                    'width': '120',
                    'height': '50',
                    // 'background-color': 'rgba(102, 127, 227, 0.84)',
                    'background-fit': 'cover',
                    'content':
                      function(e) {
                        return e.data('name');
                      },
                    'text-valign': 'center',
                    // 'color': 'white',
                    // 'text-outline-width': 2,
                    // 'text-outline-color': 'data(typeColor)'
                  }
                },
                {
                selector: 'edge',
                css:{
                    'width': '1',
                    'content':
                      function(e) {
                        return e.data('name') ? e.data('name') : 'has relation';
                      },
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                  }
                },
                {
                  selector: ':parent',
                  style: {
                    'text-valign': 'top',
                    'background-opacity': 0.333
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
                    'line-color': 'black',
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
