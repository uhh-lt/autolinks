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
        .controller('GraphController', ['$scope', '$q', '$rootScope', 'graphProperties', 'EntityService', 'EndPointService', '_', '$mdDialog',
        function ($scope, $q, $rootScope, graphProperties, EntityService, EndPointService, _, $mdDialog) {

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

          $scope.EntityService = EntityService;
          $scope.EndPointService = EndPointService;
          $scope.$mdDialog = $mdDialog;
          // $scope.fetchData = {};

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

              var nodes = [
                // { data: { id: '0', parent: 'b', name: "Disease" }, position: { x: 215, y: 85 } },
                // { data: { id: '1', name: "Caucasian race" } },
                // { data: { id: '2', name: 'B_CLL', desc: "type of leukemia (a type of cancer of the white blood cells)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Chronic_lymphocytic_leukemia.jpg/1280px-Chronic_lymphocytic_leukemia.jpg" } },
                // { data: { id: '3', name: 'B Cell', desc: "also known as B lymphocytes, are a type of white blood cell of the lymphocyte subtype.",   image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Blausen_0624_Lymphocyte_B_cell_%28crop%29.png/1024px-Blausen_0624_Lymphocyte_B_cell_%28crop%29.png" } },
                // { data: { id: '4', name: 'Antigen', parent: '8', desc: "In immunology, an antigen is a molecule capable of inducing an immune response on the part of the host organism", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Antibody.svg/255px-Antibody.svg.png" }, position: { x: 300, y: 85 } },
                // { data: { id: '5', name: "B-cell receptor", parent: '8', desc: " is a transmembrane receptor protein located on the outer surface of B cells", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Bcellreceptor.svg/251px-Bcellreceptor.svg.png" }, position: { x: 215, y: 175 } },
                // { data: { id: '6', name: "V(D)J recombination" } },
                // { data: { id: '7', name: "IgVH Mutation" }, position: { x: 300, y: 175 } },
                // { data: { id: '8', name: "BCR" }, position: { x: 300, y: 175 } }
              ];

              $scope.nodes = nodes;
              var edges = [
                // { data: { id: '20', source: '2', target: '0', name: 'is-a' } },
                // { data: { id: '21', source: '2', target: '1', name: 'affects' } },
                // { data: { id: '23', source: '2', target: '3', name: 'affects' } },
                // { data: { id: '53', source: '5', target: '3', name: 'part-of' } },
                // { data: { id: '54', source: '5', target: '4', name: 'binds' } },
                // { data: { id: '76', source: '7', target: '6', name: 'causes' } },
                // { data: { id: '65', source: '6', target: '5', name: 'affects' } }
              ];

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
              // // Enable physics for new graph data when network is initialized
              // if(!_.isUndefined(self.network)) {
              //     applyPhysicsOptions(self.physicOptions);
              // }

              $scope.loading = true;

              $scope.resultNodes = response.data.entities.map(function(n) {
                  var result = {};

                  result = { data: { id: n.data.id, parent: n.data.parent, name: n.data.name, image: n.data.image, desc: n.data.desc, metadata: n.data.metadata, path: n.data.path }};

                  if (n.position) {
                    result['position'] = { x: n.position.x, y: n.position.y }
                  }

                  // if(n.data.image){
                  //   result['data'].image = n.data.image;
                  // }
                  //
                  // if(n.data.desc){
                  //   result['data'].desc = n.data.desc;
                  // }

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
              //
              // if(!_.isUndefined(self.network)) {
              //     applyPhysicsOptions(self.physicOptions);
              // }
              //
              // self.nodes.clear();
              // self.nodesDataset.clear();
              //
              // self.edges.clear();
              // self.edgesDataset.clear();
              //
              // // Initialize the graph
              // $scope.graphData = {
              //     nodes: self.nodesDataset,
              //     edges: self.edgesDataset
              // };

              return promise.promise;
          }

          function init() {
              var promise = $q.defer();
              // $scope.fetchData = {};
              // EndPointService.fetchData().then(function(response) {
              //     $scope.fetchData = response;
              $scope.reloadGraph();
              // });
          }

          // Init the network modulegit
          init();

          // add object from the form then broadcast event which triggers the directive redrawing of the chart
          // you can pass values and add them without redrawing the entire chart, but this is the simplest way
          $scope.addObj = function(){
              // collecting data from the form
              // debugger;
              var newObj = $scope.form.obj.name;
              var newObjType = $scope.form.obj.objTypes;
              // building the new Node object
              // using the array length to generate an id for the sample (you can do it any other way)
              var newNode = {id:'n'+($scope.mapData.length), name:newObj, type:newObjType};
              // adding the new Node to the nodes array
              $scope.mapData.push(newNode);
              // broadcasting the event
              $rootScope.$broadcast('appChanged');
              // resetting the form
              $scope.form.obj = {};
          };

          // add Edges to the edges object, then broadcast the change event
          $scope.addEdge = function(){
              // collecting the data from the form
              var edge1 = $scope.formEdges.fromName.id;
              var edge2 = $scope.formEdges.toName.id;
              // building the new Edge object from the data
              // using the array length to generate an id for the sample (you can do it any other way)
              var newEdge = {id:'e'+($scope.edgeData.length), source: edge1, target: edge2};
              // adding the new edge object to the adges array
              $scope.edgeData.push(newEdge);
              // broadcasting the event
              $rootScope.$broadcast('appChanged');
              // resetting the form
              $scope.formEdges = '';
          };

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
              // sample just passes the object's ID then output it to the console and to an alert
              console.debug(value);
              alert(value);
          };

          // reset the sample nodes
          $scope.layoutReset = function(){
              $scope.mapData = [];
              $scope.edgeData = [];
              $rootScope.$broadcast('layoutReset');
          }
        }
    ]);
});
