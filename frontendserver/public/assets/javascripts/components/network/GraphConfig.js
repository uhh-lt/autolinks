define([
    'angular'
], function(angular) {
    'use strict';

    angular.module('myApp.graphConfig', [])
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
        .constant('generalOptions', {
                height: '100%',
                width: '100%',
                nodes : {
                    shape: 'box'
                    // size: 10,
                    // shadow: true,
                    // scaling: {
                    //     label: {
                    //         min: 30,
                    //         max: 45
                    //     }
                    // }
                },
                edges: {
                    length: 200,
                    color: {
                        color: 'rgb(169,169,169)',
                        highlight: 'blue'
                    }
                    // smooth: {
                    //   type:'cubicBezier',
                    //   forceDirection: 'vertical',
                    //   roundness: 0.4
                    // }
                },
                layout: {
                    improvedLayout: false,
                    hierarchical: {
                      levelSeparation: 150,
                      // layout: "hubsize",
                      enabled: true,
                      sortMethod: 'directed',
                      direction: 'DU'
                    }

                },
                interaction: {
                    tooltipDelay: 200,
                    hover: true,
                    hideEdgesOnDrag: true,
                    navigationButtons: true,
                    keyboard: false,
                    multiselect: true
                },
                // Each entry represents one named entity type
                groups: {
                    // Colorblind safe colors
                    '0': { color:  {border: "#a50026", background: "#d73027", highlight: {border: "#a50026", background: "#f46d43"}, hover: {border: "#a50026", background: "#f46d43"}}}, // 0: red
                    '1': { color:  {border: "#fdae61", background: "#fee090", highlight: {border: "#fdae61", background: "#ffffbf"}, hover: {border: "#fdae61", background: "#ffffbf"}}}, // 1: yellow
                    '2': { color:  {border: "#74add1", background: "#abd9e9", highlight: {border: "#74add1", background: "#e0f3f8"}, hover: {border: "#74add1", background: "#e0f3f8"}}}, // 2: light blue
                    '3': { color:  {border: "#313695", background: "#4575b4", highlight: {border: "#313695", background: "#74add1"}, hover: {border: "#313695", background: "#74add1"}}}, // 3: dark blue
                    // Non colorblind safe colors
                    '4': { color:  {border: "#7C29F0", background: "#AD85E4", highlight: {border: "#7C29F0", background: "#D3BDF0"}, hover: {border: "#7C29F0", background: "#D3BDF0"}}}, // 4: purple
                    '5': { color:  {border: "#E129F0", background: "#EB7DF4", highlight: {border: "#E129F0", background: "#F0B3F5"}, hover: {border: "#E129F0", background: "#F0B3F5"}}}, // 5: magenta
                    '6': { color:  {border: "#C37F00", background: "#FFA807", highlight: {border: "#C37F00", background: "#FFCA66"}, hover: {border: "#C37F00", background: "#FFCA66"}}}, // 6: orange
                    '7': { color:  {border: "#4AD63A", background: "#C2FABC", highlight: {border: "#4AD63A", background: "#E6FFE3"}, hover: {border: "#4AD63A", background: "#E6FFE3"}}}, // 7: mint
                    '8': { color:  {border: "#FD5A77", background: "#FFC0CB", highlight: {border: "#FD5A77", background: "#FFD1D9"}, hover: {border: "#FD5A77", background: "#FFD1D9"}}}, // 8: pink
                    '9': { color:  {border: "#41A906", background: "#7BE141", highlight: {border: "#41A906", background: "#A1EC76"}, hover: {border: "#41A906", background: "#A1EC76"}}}, // 9: green
                    '10': { color: {border: "#990000", background: "#EE0000", highlight: {border: "#BB0000", background: "#FF3333"}, hover: {border: "#BB0000", background: "#FF3333"}}}, // 10:bright red
                    '11': { color: {border: "#FF6000", background: "#FF6000", highlight: {border: "#FF6000", background: "#FF6000"}, hover: {border: "#FF6000", background: "#FF6000"}}},  // 12: real orange
                    '-1': { color: {border: "#4575b4", background: "#FFFFFF", highlight: {border: "#4575b4", background: "#FFFFFF"}, hover: {border: "#4575b4", background: "#FFFFFF"}}},  // -1: white / blue
                    '-2': { color: {border: "#7BE141", background: "#FFFFFF", highlight: {border: "#7BE141", background: "#FFFFFF"}, hover: {border: "#7BE141", background: "#FFFFFF"}}},  // -2: white / green
                }
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
