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
                // "onload": onNetworkLoad
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

            $scope.buildGraph = function() {

                var promise = $q.defer();

                var entities = [
                  {id: 2, label: "Bill", count: 5, type: "PER", group: 0},
                  {id: 5, label: "Kathy", count: 2, type: "PER", group: 0},
                  {id: 3, label: "Bill Group", count: 1, type: "PER", group: 0},
                  {id: 13, label: "Well", count: 1, type: "PER", group: 0},
                  {id: 14, label: "Sara Get", count: 1, type: "PER", group: 0},
                  {id: 8, label: "ST-WBOM", count: 1, type: "MISC", group: 3},
                  {id: 6, label: "El Paso", count: 2, type: "LOC", group: 1},
                  {id: 7, label: "Anyhow", count: 1, type: "LOC", group: 1},
                  {id: 11, label: "Seattle", count: 1, type: "LOC", group: 1},
                  {id: 12, label: "Europe", count: 1, type: "LOC", group: 1},
                  {id: 1, label: "EES", count: 1, type: "ORG", group: 2},
                  {id: 4, label: "St Helens", count: 1, type: "ORG", group: 2},
                  {id: 9, label: "ST-WBOM", count: 1, type: "ORG", group: 2},
                  {id: 10, label: "El Paso", count: 1, type: "ORG", group: 2},
                  {id: 15, label: "MSN Explorer", count: 1, type: "ORG", group: 2}
                ];

                var relations = [
                  {source: 2, dest: 5, occurrence: 2},
                  {source: 2, dest: 3, occurrence: 1},
                  {source: 2, dest: 13, occurrence: 1},
                  {source: 2, dest: 14, occurrence: 1},
                  {source: 2, dest: 8, occurrence: 1},
                  {source: 2, dest: 6, occurrence: 2},
                  {source: 2, dest: 7, occurrence: 1},
                  {source: 2, dest: 11, occurrence: 1},
                  {source: 2, dest: 12, occurrence: 1},
                  {source: 1, dest: 2, occurrence: 1},
                  {source: 2, dest: 4, occurrence: 1},
                  {source: 2, dest: 9, occurrence: 1},
                  {source: 2, dest: 10, occurrence: 1},
                  {source: 2, dest: 15, occurrence: 1},
                  {source: 5, dest: 6, occurrence: 2},
                  {source: 5, dest: 7, occurrence: 1},
                  {source: 4, dest: 5, occurrence: 1},
                  {source: 5, dest: 10, occurrence: 1},
                  {source: 1, dest: 3, occurrence: 1},
                  {source: 13, dest: 14, occurrence: 1},
                  {source: 11, dest: 13, occurrence: 1},
                  {source: 12, dest: 13, occurrence: 1},
                  {source: 13, dest: 15, occurrence: 1},
                  {source: 11, dest: 14, occurrence: 1},
                  {source: 12, dest: 14, occurrence: 1},
                  {source: 14, dest: 15, occurrence: 1},
                  {source: 8, dest: 9, occurrence: 1},
                  {source: 6, dest: 7, occurrence: 1},
                  {source: 4, dest: 6, occurrence: 1},
                  {source: 6, dest: 10, occurrence: 1},
                  {source: 4, dest: 7, occurrence: 1},
                  {source: 11, dest: 12, occurrence: 1},
                  {source: 11, dest: 15, occurrence: 1},
                  {source: 12, dest: 15, occurrence: 1}
                ];

                var nodes = [
                  {id: 0, label: "0", level: 0},
                  {id: 1, label: "1", level: 1},
                  {id: 2, label: "2", level: 3},
                  {id: 3, label: "3", level: 4},
                  {id: 4, label: "4", level: 4},
                  {id: 5, label: "5", level: 5},
                  {id: 6, label: "6", level: 1},
                  {id: 7, label: "7", level: 2},
                  {id: 8, label: "8", level: 4},
                  {id: 9, label: "9", level: 4},
                  {id: 10, label: "10", level: 2},
                  {id: 11, label: "11", level: 1},
                  {id: 12, label: "12", level: 2},
                  {id: 13, label: "13", level: 1},
                  {id: 14, label: "14", level: 5}
                ];

                var edges = [
                  {from: 0, to: 1, arrows:'to'},
                  {from: 0, to: 6, arrows:'to'},
                  {from: 0, to: 13, arrows:'to'},
                  {from: 0, to: 11, arrows:'to'},
                  {from: 1, to: 2, arrows:'to'},
                  {from: 2, to: 3, arrows:'to'},
                  {from: 2, to: 4, arrows:'to'},
                  {from: 3, to: 5, arrows:'to'},
                  {from: 1, to: 10, arrows:'to'},
                  {from: 1, to: 7, arrows:'to'},
                  {from: 2, to: 8, arrows:'to'},
                  {from: 2, to: 9, arrows:'to'},
                  {from: 3, to: 14, arrows:'to'},
                  {from: 1, to: 12, arrows:'to'}
                ];

                var response = {data: {entities: entities, relations: relations}};
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

                debugger;

                // Initialize the graph
                $scope.graphData = {
                    nodes: nodes,
                    edges: edges
                };
                return promise.promise;
            };

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

            $scope.reloadGraph = function () {
                clearGraph();
                $scope.buildGraph();
            };

            function init() {
                $scope.reloadGraph();
            }
            // Init the network module
            init();
        }]);
});
