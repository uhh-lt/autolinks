define([
    'angular',
    'ngMaterial',
    'ngVis'
], function(angular) {
    'use strict';
    /**
     * network module:
     * visualization and interaction of network graph
     */
    angular.module('myApp.network', ['ngMaterial', 'ngVis']);
    angular.module('myApp.network')
        // Network Controller
        .controller('NetworkController', ['$scope', '$q', '$timeout', '$compile', '$mdDialog', 'VisDataSet', '_', 'graphProperties', function ($scope, $q, $timeout, $compile, $mdDialog, VisDataSet, _, graphProperties) {

            var self = this;

            /* Background collection */
            self.nodes = new VisDataSet([]);
            self.edges = new VisDataSet([]);

            /* Graph collection filtered during runtime */
            self.nodesDataset = new VisDataSet([]);
            self.edgesDataset = new VisDataSet([]);

            $scope.graphOptions = graphProperties.options;

            $scope.graphEvents = {
                // "startStabilizing": stabilizationStart,
                // "stabilized": stabilized,
                // "stabilizationIterationsDone": stabilizationDone,
                "onload": onNetworkLoad,
                // "dragEnd": dragNodeDone,
                "oncontext": onContext,
                "click": clickEvent,
                "dragging": dragEvent,
                "hoverEdge": hoverEdge,
                "hoverNode": hoverNode
                // "blurNode": blurNode
            };

            /* Consists of objects with entity types and their id */
            $scope.types = [];
            /* Current value of the edge significance slider */
            $scope.edgeImportance = 1;
            /* Maximum edge value of the current underlying graph collection. Updated in reload method */
            $scope.maxEdgeImportance = 80000;
            /* Indicates whether the network is initialized or new data is being loaded */
            $scope.loading = true;
            /* Determines how many keywords should be shown in the edge tooltip */
            self.numEdgeKeywords = 10;
            /* Determines whether the edge importance filter should be preserved during graph reloading */
            self.preserveEdgeImportance = false;

            $scope.resultNodes = [];
            $scope.resultRelations = [];

            // var url=[];

            $scope.title = "<div class='panel panel-success' style='margin-bottom:0px'>"+
                          "<div class='panel-heading'>"+
                            "<h3 class='panel-title'>Agent</h3>"+
                          "</div>"+
                          "<div class='panel-body' style='height: 145px; padding-top: 0px; padding-bottom: 0px'>"+
                            "<table class='table' style='border: none; margin-bottom:1px'>"+
                              "<tr>"+
                                "<td>Agent</td>"+
                                "<td>true</td>"+
                                "<td>2015-04-02 16:02</td>"+
                              "</tr>"+
                              "<tr>"+
                                "<td>CPU</td>"+
                                "<td>1%</td>"+
                                "<td>2015-04-02 16:02</td>"+
                              "</tr>"+
                              "<tr>"+
                                "<td>Memory</td>"+
                                "<td>2%</td>"+
                                "<td>2015-04-02 16:02</td>"+
                              "</tr>"+
                              "<tr>"+
                                "<td>Disk</td>"+
                                "<td>10%</td>"+
                                "<td>2015-04-02 16:02</td>"+
                              "</tr>"+
                            "</table>"+
                          "</div>"+
                        "</div>";

            // Context menu for single node selection
            self.singleNodeMenu = [
                {
                    title: 'Context filter'
                }
            ];

            $scope.buildGraph = function() {

                var promise = $q.defer();

                var nodes = [
                  {
                    id: 0,
                    label: "Disease",
                    desc: "",
                    url: "",
                    // image: url,
                    x: -101, y: -300
                  },
                  {
                    id: 1,
                    // title: "Caucasian race",
                    title: $scope.title,
                    label: "grouping of human beings historically regarded as a biological taxon [..], including populations of Europe, the Caucasus, Asia Minor, North Africa, the Horn of Africa, Western Asia, Central Asia and South Asia.[3]",
                    widthConstraint: { maximum: 170 },
                    url: "https://upload.wikimedia.org/wikipedia/commons/8/89/Caucasoid_skull.jpg",
                  },
                  {
                    id: 2,
                    title: "B-CLL",
                    label: "type of leukemia (a type of cancer of the white blood cells)",
                    widthConstraint: { maximum: 170 },
                    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Chronic_lymphocytic_leukemia.jpg/1280px-Chronic_lymphocytic_leukemia.jpg"
                  },
                  // {id: 1, 'label': "0x00405a62:\nmov    eax, 0x00000002\nmov    ecx, DWORD PTR ss:[esp + 0x000000a8]\nmov    DWORD PTR fs:[0x00000000], ecx\npop    ecx\npop    esi\npop    ebp\npop    ebx\nadd    esp, 0x000000a4\nret\n", 'color': "#FFCFCF", 'shape': 'box', 'font': {'face': 'monospace', 'align': 'left'}, level: 1},
                  {
                    id: 3,
                    title: "B Cell",
                    label: "also known as B lymphocytes, are a type of white blood cell of the lymphocyte subtype.",
                    widthConstraint: { maximum: 170 },
                    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Blausen_0624_Lymphocyte_B_cell_%28crop%29.png/1024px-Blausen_0624_Lymphocyte_B_cell_%28crop%29.png"
                  },
                  {
                    id: 4,
                    title: "Antigen",
                    cid: 1,
                    label: "In immunology, an antigen is a molecule capable of inducing an immune response on the part of the host organism,",
                    widthConstraint: { maximum: 170 },
                    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Antibody.svg/255px-Antibody.svg.png"
                  },
                  {
                    id: 5,
                    title: "B-cell receptor",
                    cid: 1,
                    label: " is a transmembrane receptor protein located on the outer surface of B cells",
                    widthConstraint: { maximum: 170 },
                    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Bcellreceptor.svg/251px-Bcellreceptor.svg.png"
                  },
                  {
                    id: 6,
                    label: "V(D)J recombination",
                    desc: "",
                    url: ""
                  },
                  {
                    id: 7,
                    label: "IgVH Mutation",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Bcellreceptor.svg/251px-Bcellreceptor.svg.png",
                    shape: 'image',
                    desc: "",
                    url: ""
                  }
                ];

                $scope.nodes = nodes;
                var edges = [
                  {from: 2, to: 0, arrows:'to', label: 'is-a'},
                  {from: 2, to: 1, arrows:'to', label: 'affects'},
                  {from: 2, to: 3, arrows:'to', label: 'affects'},
                  {from: 5, to: 3, arrows:'to', label: 'part-of'},
                  {from: 5, to: 4, arrows:'to', label: 'binds'},
                  {from: 7, to: 6, arrows:'to', label: 'causes'},
                  {from: 6, to: 5, arrows:'to', label: 'affects'}
                ];

                var response = {data: {entities: nodes, relations: edges}};
                // Enable physics for new graph data when network is initialized
                if(!_.isUndefined(self.network)) {
                    applyPhysicsOptions(self.physicOptions);
                }
                $scope.loading = true;

                $scope.resultNodes = response.data.entities.map(function(n) {
                    // See css property div.network-tooltip for custom tooltip styling
                    return { id: n.id, label: n.label, type: n.type, value: n.count, group: n.group };
                });

                self.nodesDataset.clear();
                self.nodesDataset.add($scope.resultNodes);

                self.nodes.clear();

                $scope.resultRelations = response.data.relations.map(function(n) {
                    return { from: n.source, to: n.dest, value: n.occurrence };
                });

                self.edges.clear();
                self.edgesDataset.clear();
                self.edgesDataset.add($scope.resultRelations);

                // Initialize the graph
                $scope.graphData = {
                    nodes: nodes,
                    edges: edges
                };
                return promise.promise;
            };

            function hoverEdge(event) {
              // debugger;
            }

            function clickEvent(event) {
              // debugger;
            }

            function hoverNode(event) {
                var node = self.nodesDataset.get(event.node);
                var nodeLabel = '' + node.label;
                // var filters = currentFilter();
                // playRoutes.controllers.NetworkController.getNeighborCounts(filters.fulltext, filters.facets, filters.entities, filters.timeRange, filters.timeRangeX, node.id).get().then(function(response) {
                    // var formattedTerms = response.data.map(function(t) { return '' +  t.type + ': ' + t.count; });
//
                    var docTip = '<p>Occurs in <b> </b>documents</p><p>Type: <b> </b></p>';
                    var neighborTip = '<p><b>Neighbors</b></p><ul><li>test</li><li></li></ul>';
                    var tooltip = docTip + neighborTip;
                    // debugger;
                    self.nodesDataset.update({ id: node.id, title: tooltip });
                // });
            }


            function clearGraph() {

                var promise = $q.defer();

                if(!_.isUndefined(self.network)) {
                    applyPhysicsOptions(self.physicOptions);
                }

                self.nodes.clear();
                self.nodesDataset.clear();

                self.edges.clear();
                self.edgesDataset.clear();

                // Initialize the graph
                $scope.graphData = {
                    nodes: self.nodesDataset,
                    edges: self.edgesDataset
                };

                return promise.promise;
            }

            var imageObj = new Image();
            imageObj.src = 'http://www.rd.com/wp-content/uploads/sites/2/2016/02/03-train-cat-come-on-command.jpg';


            // network.on("afterDrawing", function (ctx) {
            //   initSizes('html-node-1', 1);
            //   initSizes('html-node-2', 2);
            //   initSizes('html-node-3', 3);
            //   initSizes('html-node-4', 4);
            //   initSizes('html-node-5', 5);
            //
            //   placeOverlay('html-node-1', 1);
            //   placeOverlay('html-node-2', 2);
            //   placeOverlay('html-node-3', 3);
            //   placeOverlay('html-node-4', 4);
            //   placeOverlay('html-node-5', 5);
            // });

            // network.on("beforeDrawing", function (ctx) {
            //   // debugger;} else if (undefined == node.parentEdgeId) {
            //   var nodeId = '8';
            //   var nodePosition = network.getPositions([nodeId]);
            //
            //   ctx.drawImage(imageObj, nodePosition[nodeId].x - 20, nodePosition[nodeId].y - 20, 40, 40);
            //
            // });

            // function clusterByCid() {
            //     network.setData(scope.data);
            //     // debugger;
            //     var clusterOptionsByData = {
            //         joinCondition:function(childOptions) {
            //           if (childOptions.cid) {
            //             debugger;
            //             document.getElementById('html-node-' + childOptions.id).style.opacity = 0;
            //           }
            //           return childOptions.cid == 1;
            //         },
            //         clusterNodeProperties: {id:'cidCluster', borderWidth:3, shape:'database'}
            //     };
            //     network.cluster(clusterOptionsByData);
            // }

            // clusterByCid();

            // network.on('click', function (params) {
            //   // debugger;
            //     if (params.nodes.length == 1) {
            //         if (network.isCluster(params.nodes[0]) == true) {
            //           debugger;
            //             network.openCluster(params.nodes[0]);
            //             document.getElementById('html-node-4').style.opacity = 100;
            //         }
            //     }
            // });


            // network.once('stabilized', function() {
            //     var scaleOption = { scale : 2.0 };
            //     network.moveTo(scaleOption);
            // })

            $scope.reloadGraph = function () {
                clearGraph();
                $scope.buildGraph();
            };

            function init() {
                $scope.reloadGraph();
            }
            // Init the network modulegit
            init();

            function onNetworkLoad(network) {
                self.network = network;
            }

            function clickEvent(event) {
                closeContextMenu();
            }

            function dragEvent(event) {
                closeContextMenu();
            }

            function onContext(params) {
                params.event.preventDefault();
                closeContextMenu();

                var position = { x: params.pointer.DOM.x, y: params.pointer.DOM.y };

                var nodeIdOpt = self.network.getNodeAt(position);
                var edgeIdOpt = self.network.getEdgeAt(position);

                var selection = self.network.getSelectedNodes();

                // Multiple nodes selected and the right-clicked node is in this selection
                if(!_.isUndefined(nodeIdOpt) && selection.length > 1 && _.contains(selection, nodeIdOpt)) {
                    showContextMenu(_.extend(position, { id: selection }), self.multiNodeMenu);
                }
                // Single node selected
                else if(!_.isUndefined(nodeIdOpt)) {
                    self.network.selectNodes([nodeIdOpt]);
                    showContextMenu(_.extend(position, { id: nodeIdOpt }), self.singleNodeMenu);
                // Edge selected
                } else if(!_.isUndefined(edgeIdOpt)) {
                    self.network.selectEdges([edgeIdOpt]);
                    showContextMenu(_.extend(position, { id: edgeIdOpt }), self.edgeMenu);
                }
                else {
                    // Nop
                }
            }

            function showContextMenu(params, menuEntries) {
                var container = document.getElementById('mynetwork');

                var offsetLeft = container.offsetLeft;
                var offsetTop = container.offsetTop;

                self.popupMenu = document.createElement("div");
                self.popupMenu.className = 'popupMenu';
                self.popupMenu.style.left = params.x + 'px';
                self.popupMenu.style.top =  params.y + 'px';

                var ul = document.createElement('ul');
                self.popupMenu.appendChild(ul);

                for (var i = 0; i < menuEntries.length; i++) {
                    var li = document.createElement('li');
                    ul.appendChild(li);
                    li.innerHTML = li.innerHTML + menuEntries[i].title;
                    (function(value, id, action){
                        li.addEventListener("click", function() {
                            closeContextMenu();
                            action(value, id);
                        }, false);})(menuEntries[i].title, params.id, menuEntries[i].action);
                }
                document.body.appendChild(self.popupMenu);
                //container.appendChild(self.popupMenu);
            }

            function closeContextMenu() {
                if (self.popupMenu !== undefined) {
                    self.popupMenu.parentNode.removeChild(self.popupMenu);
                    self.popupMenu = undefined;
                }
            }
        }]);
});
