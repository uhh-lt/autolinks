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
    angular.module('autolinks.network', ['ngMaterial', 'ngVis']);
    angular.module('autolinks.network')
        // Network Controller
        .controller('NetworkController', ['$scope', '$q', '$timeout', '$compile', '$mdDialog', 'VisDataSet', '_', 'graphProperties', 'EntityService', '$mdSidenav',
         function ($scope, $q, $timeout, $compile, $mdDialog, VisDataSet, _, graphProperties, EntityService, $mdSidenav) {

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
                "selectNode": selectNodeEvent,
                "dragging": dragEvent,
                "hoverEdge": hoverEdge,
                "hoverNode": hoverNode,
                "clearPopUp": clearPopUp
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
                    label: "Caucasian race",
                    desc: "grouping of human beings historically regarded as a biological taxon [..], including populations of Europe, the Caucasus, Asia Minor, North Africa, the Horn of Africa, Western Asia, Central Asia and South Asia.[3]",
                    widthConstraint: { maximum: 170 },
                    image: "https://upload.wikimedia.org/wikipedia/commons/8/89/Caucasoid_skull.jpg",
                    shape: 'image'
                  },
                  {
                    id: 2,
                    label: "B-CLL",
                    desc: "type of leukemia (a type of cancer of the white blood cells)",
                    widthConstraint: { maximum: 170 },
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Chronic_lymphocytic_leukemia.jpg/1280px-Chronic_lymphocytic_leukemia.jpg",
                    shape: 'image'
                  },
                  // {id: 1, 'label': "0x00405a62:\nmov    eax, 0x00000002\nmov    ecx, DWORD PTR ss:[esp + 0x000000a8]\nmov    DWORD PTR fs:[0x00000000], ecx\npop    ecx\npop    esi\npop    ebp\npop    ebx\nadd    esp, 0x000000a4\nret\n", 'color': "#FFCFCF", 'shape': 'box', 'font': {'face': 'monospace', 'align': 'left'}, level: 1},
                  {
                    id: 3,
                    label: "B Cell",
                    desc: "also known as B lymphocytes, are a type of white blood cell of the lymphocyte subtype.",
                    widthConstraint: { maximum: 170 },
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Blausen_0624_Lymphocyte_B_cell_%28crop%29.png/1024px-Blausen_0624_Lymphocyte_B_cell_%28crop%29.png",
                    shape: 'image'
                  },
                  {
                    id: 4,
                    label: "Antigen",
                    cid: 1,
                    desc: "In immunology, an antigen is a molecule capable of inducing an immune response on the part of the host organism,",
                    widthConstraint: { maximum: 170 },
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Antibody.svg/255px-Antibody.svg.png",
                    shape: 'image'
                  },
                  {
                    id: 5,
                    label: "B-cell receptor",
                    cid: 1,
                    desc: " is a transmembrane receptor protein located on the outer surface of B cells",
                    widthConstraint: { maximum: 170 },
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Bcellreceptor.svg/251px-Bcellreceptor.svg.png",
                    shape: 'image'
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
                    var result = {};
                    if (n.image) {
                      result = { id: n.id, label: n.label, widthConstraint: { maximum: 170 }, desc: n.desc, image: n.image, shape: 'image' };
                    } else {
                      result = { id: n.id, label: n.label, widthConstraint: { maximum: 170 }};
                    }
                    return result;
                });

                self.nodesDataset.clear();
                self.nodesDataset.add($scope.resultNodes);

                self.nodes.clear();

                $scope.resultRelations = response.data.relations.map(function(n) {
                    return { from: n.from, to: n.to, label: n.label };
                });

                self.edges.clear();
                self.edgesDataset.clear();
                self.edgesDataset.add($scope.resultRelations);

                // Initialize the graph
                $scope.graphData = {
                    nodes: self.nodesDataset,
                    edges: self.edgesDataset
                };
                return promise.promise;
            };

            function hoverEdge(event) {
              // debugger;
            }

            function clickEvent(event) {
              // debugger;
            }

            function clearPopUp() {
              document.getElementById('saveButton').onclick = null;
              document.getElementById('cancelButton').onclick = null;
              document.getElementById('network-popUp').style.display = 'none';
            }

            function hoverNode(event) {
                var node = self.nodesDataset.get(event.node);
                var nodeLabel = '' + node.label;
                var docTip = '<md-card class="tooltip-card"><img src="' + node.image +'" class="md-card-image">' +
                            '<md-card-title><md-card-title-text><span class="md-headline">' + node.label + '</span></md-card-title-text></md-card-title>'+
                            '<md-card-content>' + (node.desc ? node.desc : '') + '</md-card-content>' +
                            '</md-card>';
                var tooltip = docTip;
                self.nodesDataset.update({ id: node.id, title: tooltip });
                document.getElementsByClassName('vis-tooltip')[0].style.opacity = 100;
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

            $scope.toggleRight = buildToggler('right');
            $scope.isOpenRight = function(){
              return $mdSidenav('right').isOpen();
            };

            $scope.reloadGraph = function () {
                clearGraph();
                $scope.buildGraph();
            };

            function buildToggler(navID) {
              return function() {
                // Component lookup should always be available since we are not using `ng-if`
                $mdSidenav(navID)
                  .toggle()
                  .then(function () {
                    $log.debug("toggle " + navID + " is done");
                  });
              };
            }

            function init() {
                $scope.reloadGraph();
            }
            // Init the network modulegit
            init();

            function onNetworkLoad(network) {
                self.network = network;
            }

            function clickEvent(event) {
              var node = self.nodesDataset.get(event.node);
              // debugger;
              closeContextMenu();
            }

            function selectNodeEvent(event) {
              document.getElementsByClassName('vis-tooltip')[0].style.opacity = 0;
              closeContextMenu();
              var node = self.nodesDataset.get(event.nodes[0]);
              EntityService.openSideNav(node);
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

                // Single node selected
                if(!_.isUndefined(nodeIdOpt)) {
                    self.network.selectNodes([nodeIdOpt]);
                    showContextMenu(_.extend(position, { id: nodeIdOpt }), self.singleNodeMenu);
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
