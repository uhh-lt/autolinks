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
        .controller('GraphController', ['$scope', '$q', '$rootScope', 'graphProperties',
        function ($scope, $q, $rootScope, graphProperties) {

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
              edgehandles(cytoscape);
          }

          $scope.edgehandler = false;
          // container objects
          $scope.mapData = [];
          $scope.edgeData = [];
          // data types/groups object - used Cytoscape's shapes just to make it more clear
          $scope.objTypes = ['ellipse','triangle','rectangle','roundrectangle','pentagon','octagon','hexagon','heptagon','star'];


          $scope.buildGraph = function() {

              var promise = $q.defer();

              var nodes = [
                { data: { id: 'a', parent: 'b', name: "Disease" }, position: { x: 215, y: 85 } },
                { data: { id: 'b', name: "Caucasian race" } },
                { data: { id: 'g', parent: 'a' } },
                { data: { id: 'h', parent: 'a' } },
                { data: { id: 'c', parent: 'b' }, position: { x: 300, y: 85 } },
                { data: { id: 'd', name: "Caucasian race"}, position: { x: 215, y: 175 } },
                { data: { id: 'e' } },
                { data: { id: 'f', parent: 'e' }, position: { x: 300, y: 175 } }
              ];

              $scope.nodes = nodes;
              var edges = [
                { data: { id: 'ad', source: 'd', target: 'g' } },
                { data: { id: 'eb', source: 'e', target: 'b' } }
              ];

              var response = {data: {entities: nodes, relations: edges}};
              // // Enable physics for new graph data when network is initialized
              // if(!_.isUndefined(self.network)) {
              //     applyPhysicsOptions(self.physicOptions);
              // }

              $scope.loading = true;

              $scope.resultNodes = response.data.entities.map(function(n) {
                  var result = {};
                  if (n.data.parent) {
                    result = { data: { id: n.data.id, parent: n.data.parent, name: n.data.name }};
                  } else {
                    result = { data: { id: n.data.id, name: n.data.name }};
                  }

                  if (n.position) {
                    result['position'] = { x: n.position.x, y: n.position.y }
                  }

                  return result;
              });

              self.nodesDataset = [];
              self.nodesDataset.push($scope.resultNodes);

              self.nodes = [];

              $scope.resultRelations = response.data.relations.map(function(n) {
                  return {  data: { id: n.data.id, source: n.data.source, target: n.data.target } };
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
              $scope.reloadGraph();
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

          // the default values of each option are outlined below:
          let defaults = {
            preview: true, // whether to show added edges preview before releasing selection
            hoverDelay: 150, // time spent hovering over a target node before it is considered selected
            handleNodes: 'node', // selector/filter function for whether edges can be made from a given node
            handlePosition: 'middle top', // sets the position of the handle in the format of "X-AXIS Y-AXIS" such as "left top", "middle top"
            handleInDrawMode: false, // whether to show the handle in draw mode
            edgeType: function( sourceNode, targetNode ){
              // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
              // returning null/undefined means an edge can't be added between the two nodes
              return 'flat';
            },
            loopAllowed: function( node ){
              // for the specified node, return whether edges from itself to itself are allowed
              return false;
            },
            nodeLoopOffset: -50, // offset for edgeType: 'node' loops
            nodeParams: function( sourceNode, targetNode ){
              // for edges between the specified source and target
              // return element object to be passed to cy.add() for intermediary node
              return {};
            },
            edgeParams: function( sourceNode, targetNode, i ){
              // for edges between the specified source and target
              // return element object to be passed to cy.add() for edge
              // NB: i indicates edge index in case of edgeType: 'node'
              return {};
            },
            show: function( sourceNode ){
              // fired when handle is shown
            },
            hide: function( sourceNode ){
              // fired when the handle is hidden
            },
            start: function( sourceNode ){
              // fired when edgehandles interaction starts (drag on handle)
            },
            complete: function( sourceNode, targetNode, addedEles ){
              // fired when edgehandles is done and elements are added
            },
            stop: function( sourceNode ){
              // fired when edgehandles interaction is stopped (either complete with added edges or incomplete)
            },
            cancel: function( sourceNode, cancelledTargets ){
              // fired when edgehandles are cancelled (incomplete gesture)
            },
            hoverover: function( sourceNode, targetNode ){
              // fired when a target is hovered
            },
            hoverout: function( sourceNode, targetNode ){
              // fired when a target isn't hovered anymore
            },
            previewon: function( sourceNode, targetNode, previewEles ){
              // fired when preview is shown
            },
            previewoff: function( sourceNode, targetNode, previewEles ){
              // fired when preview is hidden
            },
            drawon: function(){
              // fired when draw mode enabled
            },
            drawoff: function(){
              // fired when draw mode disabled
            }
          };


          // add Edges with edgehandler
          $scope.activateEdgeHandle = function(){
            $scope.edgehandler = true;
            self.cy.edgehandles(defaults);
          };

          $scope.disableEdgeHandle = function(){
            $scope.edgehandler = false;
            debugger;
            // self.cy.edgehandles(defaults).disable();
              // self.cy.edgehandles('disable').stop();
              // self.cy.edgehandles('disable').disableDrawMode();
              // self.cy.edgehandles('disable').destroy();
            // self.cy.edgehandles().destroy();

          };

          // delete a node
          $scope.delObj = function(){
            if (self.cy.$(":selected").length > 0) {
                self.cy.$(":selected").remove();
            }
          }

          // sample function to be called when clicking on an object in the chart
          $scope.doClick = function(value)
          {
              // sample just passes the object's ID then output it to the console and to an alert
              console.debug(value);
              alert(value);
          };

          // reset the sample nodes
          $scope.reset = function(){
              $scope.mapData = [];
              $scope.edgeData = [];
              $rootScope.$broadcast('appChanged');
          }
        }
    ]);
});
