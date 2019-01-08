define([
    'angular',
    'cytoscape',
    'cytoscape-edgehandles',
    'jquery',
    'ngCy'
], function(angular, cytoscape, edgehandles, $) {
    'use strict';
    /**
     * network graph module:
     * visualization and interaction of network graph
     */
    angular.module('autolinks.graph', ['ngCy']);
    angular.module('autolinks.graph')
        // Graph Controller
        .controller('GraphController', ['$scope', '$q', '$rootScope', 'graphProperties', 'EntityService', 'EndPointService', '_', '$mdDialog', '$mdToast',
        function ($scope, $q, $rootScope, graphProperties, EntityService, EndPointService, _, $mdDialog, $mdToast) {

          var self = this;
          /* Background collection */
          self.nodes = [];
          self.edges = [];

          /* Graph collection filtered during runtime */
          self.nodesDataset = [];
          self.edgesDataset = [];

          $scope.graphOptions = graphProperties.options;

          $scope.graphEvents = {
              "onload": onNetworkLoad
          };

          function onNetworkLoad(cy) {
              self.cy = cy;
          }

          $scope.progressBarIsActive = false;
          $scope.progressStatus = 'Loading';
          $scope.EntityService = EntityService;
          $scope.EndPointService = EndPointService;
          $scope.$mdDialog = $mdDialog;
          $scope.$mdToast = $mdToast;

          $scope.edgehandler = false;
          // container objects
          $scope.mapData = [];
          $scope.edgeData = [];
          // data types/groups object - used Cytoscape's shapes just to make it more clear
          $scope.objTypes = ['ellipse','triangle','rectangle','roundrectangle','pentagon','octagon','hexagon','heptagon','star'];


          $scope.buildGraph = function() {

              var promise = $q.defer();

              var newNode = [];
              var newEdge = [];

              var nodes = [];

              $scope.nodes = nodes;
              var edges = [];

              if ($scope.fetchData) {
                $scope.fetchData.forEach(function(n) {
                  var subject = {
                      id: n.subject,
                      name: n.subject
                  };
                  var object = {
                      id: n.object,
                      name: n.object
                  };
                  var edge = {
                    data: {
                      id: ( n.subject + n.object ),
                      source: n.subject,
                      target: n.object,
                      name: n.predicate
                    }
                  }
                  newNode.push(subject, object);
                  newEdge.push(edge);
                });

                var filterNode = [];
                _.forEach(_.uniqBy(newNode, 'id'), function(n) {
                  filterNode.push({data: n});
                });

                nodes = _.union(nodes, filterNode);
                edges = _.union(edges, newEdge);
              }

              var response = {data: {entities: nodes, relations: edges}};

              $scope.loading = true;

              $scope.resultNodes = response.data.entities.map(function(n) {
                  var result = {};

                  result = { data: { id: n.data.id, parent: n.data.parent, name: n.data.name, image: n.data.image, desc: n.data.desc, metadata: n.data.metadata, path: n.data.path }};

                  if (n.position) {
                    result['position'] = { x: n.position.x, y: n.position.y }
                  }

                  return result;
              });

              self.nodesDataset = [];
              self.nodesDataset.push($scope.resultNodes);

              self.nodes = [];

              $scope.resultRelations = response.data.relations.map(function(n) {
                  return {  data: { id: n.data.id, source: n.data.source, target: n.data.target, name: n.data.name, path: n.data.path  } };
              });

              self.edges = [];
              self.edgesDataset = [];
              self.edgesDataset.push($scope.resultRelations);

              // Initialize the graph
              $scope.graphData = {
                  nodes: self.nodesDataset[0],
                  edges: self.edgesDataset[0]
              };
              return promise.promise;
          };

          $scope.reloadGraph = function () {
              clearGraph();
              $scope.buildGraph();
          };

          function clearGraph() {
              var promise = $q.defer();
              return promise.promise;
          }

          function init() {
              var promise = $q.defer();
              $scope.reloadGraph();
          }

          // Init the network modulegit
          init();

          // add Edges with edgehandler
          $scope.activateEdgeHandle = function(){
            $scope.edgehandler = true;
            // self.cy.edgehandles(defaults);
            $scope.reset();
          };

          $scope.disableEdgeHandle = function(){
            $scope.edgehandler = false;
            $scope.reset();
          };

          // delete a node
          $scope.delObj = function(){
            if (self.cy.$(":selected").length > 0) {
                self.cy.$(":selected").remove();
            }
          }

          $scope.centerGraph = function() {
            self.cy.fit();
          };

          // sample function to be called when clicking on an object in the chart
          $scope.doClick = function(value)
          {
              console.debug(value);
              alert(value);
          };

          // reset the sample nodes
          $scope.layoutReset = function() {
              $scope.mapData = [];
              $scope.edgeData = [];
              $rootScope.$emit('layoutReset');
          };

          $rootScope.$on('activateProgressBar', function(event, status) {
              $scope.progressBarIsActive = true;
              $scope.progressStatus = status;
          });
          $rootScope.$on('deactivateProgressBar', function() {
              $scope.progressBarIsActive = false;
          });
        }
    ]);
});
