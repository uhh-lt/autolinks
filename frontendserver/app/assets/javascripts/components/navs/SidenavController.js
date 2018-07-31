define([
    'angular',
], function(angular) {
    'use strict';
    /**
     * viewer module:
     */
    angular.module('autolinks.sidenav', []);
    angular.module('autolinks.sidenav')
        // Viewer Controller
        .controller('SidenavController', ['$scope', '$rootScope', '$timeout', '$mdSidenav', '$mdDialog', '$log', 'EntityService', 'EndPointService', '_',
        function ($scope, $rootScope, $timeout, $mdSidenav, $mdDialog, $log, EntityService, EndPointService, _) {

          $scope.label = '';
          $scope.toggle = {};
          $scope.metadata = {};
          $scope.provenances = [];

          $scope.init = function() {
            // $timeout( function() {
              $scope.selectedEntity = EntityService.getRootScopeEntity();
              const entity = $scope.selectedEntity;
              if (entity._private) {
                const metadata = entity._private.data.metadata;

                EndPointService.getDocuments().then(function(response) {
                  $scope.documents = response.data;

                  let sources = _.clone(entity._private.data.provenances);
                  sources = _.forEach(sources, function(source) {
                    if (_.includes(source, 'service::')) {
                      const split = _.split(_.split(source, '::')[1], ':');
                      $scope.provenances.push({
                        surface: source.replace('service::', ''),
                        origin: source,
                        path: split[1]
                      });
                    } else {
                      const split = _.split(_.split(source, '::')[1], ':');
                      const docId = split[2];
                      const activeDoc = _.filter($scope.documents, function(doc) { return doc.did == docId });
                      if (!_.includes(source, 'annotations::') && (activeDoc.length > 0)) {
                        $scope.provenances.push({
                          // surface: source.replace('annotation::', ''),
                          surface: activeDoc[0].filename + '(' + split[3] +')',
                          origin: source,
                          filename: activeDoc[0].filename,
                          did: split[2],
                          start: split[3],
                          end: split[4]
                        });
                      }
                    };
                  });
                  $scope.provenances = _.uniqBy($scope.provenances, 'surface');
                });

                if (metadata) {
                  $scope.metadata = metadata;
                  $scope.metadata_before = _.clone(entity._private.data.metadata);
                  $scope.metadata_keys = Object.keys($scope.metadata);
                }
                document.getElementById("propertify").innerHTML = JSON.stringify($scope.selectedEntity._private.data, undefined, 4);
              }
              console.log($scope.selectedEntity);
            // }, 1000);
            // return 'OK';
          };

          $rootScope.$on('sidenavReinit', function (event, args) {
            $scope.init();
            $mdSidenav('right').open();
          });

          $scope.init();
          // $scope.selectedEntity = EntityService.getRootScopeEntity();
          // console.log(selectedEntity);

          // // add Edges to the edges object, then broadcast the change event
          $scope.update = function() {
              const entity = $scope.selectedEntity;
              if (entity.data('rid')) {
                const before = {
                  "rid": entity.data('rid'),
                  "cid": entity.data('cid'),
                  "metadata": $scope.metadata_before ? $scope.metadata_before : {}
                  // "value": entity.data('name') ? entity.data('name') : {}
                };
                const after = {
                  "rid": entity.data('rid'),
                  "cid": entity.data('cid'),
                  "metadata": $scope.metadata ? $scope.metadata : {}
                  // "value": entity.data('name') ? entity.data('name') : {}
                };
                const data = { before: before, after: after};
                EndPointService.editResource(data);
              } else {
                entity.data().metadata = $scope.metadata;
              }
              $mdSidenav('right').close();
              cy.$(":selected").data('metadata', $scope.metadata); //TODO: alternative to trigger('tap') but needs to do more testing
              // cy.$(':selected').trigger('tap'); //TODO: change tap, since it triggers x undefined cueUtilities error

              // $scope.selectedEntity = EntityService.updateRootScopeEntity($scope.selectedEntity);
              // // broadcasting the event
              // // $rootScope.$emit('appChanged');
              // $mdSidenav('right').close();
          };

          $scope.navigateTo = function(pvc) {
            $scope.selectedPvc = pvc;
            if (_.includes(pvc.origin, 'service::')) {
              $scope.dataPath = { endpoint: { path: pvc.path }}
              EndPointService.getService(pvc.surface).then(function(response) {
                $rootScope.$emit('addEntity', { entity: response, data: $scope.dataPath });
              });
            } else {
              EndPointService.loadDoc(pvc.did).then(function(response) {
                if (_.includes($scope.selectedPvc.origin, 'annotation::')) {
                  const resp = {data: response.data, pvc: $scope.selectedPvc};
                  $rootScope.$emit('navigateToDocFromSource', resp);
                  $rootScope.$emit('checkedDoc', {did: resp.pvc.did, name: resp.pvc.filename});
                  $rootScope.$emit('deactivateProgressBar');
                }
              });
            }
          }

          $scope.createCompound = function() {
              $rootScope.$emit('createCompound');
              $mdSidenav('right').close();
          };

          $scope.deleteMetadata = function(meta, $index) {
            var deleted_object = $scope.metadata_keys[$index];
            delete $scope.metadata[deleted_object];
            $scope.metadata_keys.splice($index, 1);
          }

          $scope.delete = function(ev) {
              const entity = $scope.selectedEntity;
              const label = $scope.label;
              var entName = entity.data('metadata') && entity.data('metadata').label ?  entity.data('metadata').label : entity.data('name');

              var confirm = $mdDialog.confirm()
                   .title('Are you sure to delete ' + entName + ' node ?')
                   .targetEvent(ev)
                   .ok('Yes, delete it!')
                   .cancel('Cancel');

              $mdDialog.show(confirm).then(function() {
                if (entity.data('rid')) {
                  const before = {
                    "rid": entity.data('rid'),
                    "cid": entity.data('cid'),
                    "metadata": $scope.metadata ? $scope.metadata : {},
                    "value": entity.data('name') ? entity.data('name') : {}
                  };

                  const data = { before: before, after: null };
                  EndPointService.editResource(data);
                }
                EntityService.deleteEntity();
                $mdSidenav('right').close();
              }, function() {
               // cancel function
              });

          };

          $scope.add = function () {
            if ($scope.selectedEntity.data('metadata')) {
              $scope.metadata_keys.push("");
              $scope.toggle.metadata = true;
            } else  {
              $scope.selectedEntity.data().metadata = {};
              const metadata = $scope.selectedEntity.data('metadata');
              $scope.metadata = metadata;
              $scope.metadata_before = _.clone($scope.selectedEntity.data('metadata'));
              $scope.metadata_keys = Object.keys($scope.metadata);
              $scope.metadata_keys.push("");
              $scope.toggle.metadata = true;
            }

          };

          $scope.close = function () {
            // Component lookup should always be available since we are not using `ng-if`
            // $route.reload();
            EndPointService.fetchData();

            $mdSidenav('right').close()
              .then(function () {
                document.getElementById("propertify").innerHTML = '{}';
                $log.debug("close RIGHT is done");
              });
          };

        }
      ]);
});
