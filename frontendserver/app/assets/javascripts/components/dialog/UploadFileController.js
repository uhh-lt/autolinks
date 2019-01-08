define([
    'angular',
    'jquery',
    'ngFileUpload'
], function(angular) {
    'use strict';
    /**
     * uploadfile module:
     */
    angular.module('autolinks.upload', ['ngFileUpload']);
    angular.module('autolinks.upload')
        // UploadFile Controller
        .controller('UploadFileController', ['Upload', '$window', '$scope', '$rootScope', '$mdDialog', '$q', 'EndPointService', '$mdToast', '$timeout',
        function (Upload, $window, $scope, $rootScope, $mdDialog, $q, EndPointService, $mdToast, $timeout) {

          var vm = this;
          $scope.overwrite = "";

          vm.submit = function(){ //function to call on form submit
              if (vm.upload_form.file.$valid && vm.file) { //check if from is valid
                  vm.upload(vm.file, $scope.overwrite); //call upload function
              }
          }
          vm.upload = function (file, overwrite) {
              // upload API
              $rootScope.$emit('activateProgressBar', 'uploading a file');
              Upload.upload({
                  url: '/api/storage/postDocuments', //webAPI exposed to upload the file
                  data:{ docFile: file, overwrite } //pass file as data, should be user ng-model
              }).then(function (resp) { //upload function returns a promise
                  $mdDialog.hide();
                  if(resp.status === 200 && resp.data.did) { //validate success
                    $mdToast.show(
                          $mdToast.simple()
                            .textContent('Document ' + resp.data.name + ' with did: ' + resp.data.did + ' is uploaded!')
                            .position('top right')
                            .theme("primary-toast")
                            .hideDelay(3500)
                        );
                     if (resp.config.data.overwrite === "true") {
                       $rootScope.$emit('addDocument', resp.data, true);
                     } else {
                       $rootScope.$emit('addDocument', resp.data);
                     }
                     EndPointService.setSelectedDoc(resp.data);
                  } else {
                    $mdToast.show(
                          $mdToast.simple()
                            .textContent(resp.data.message)
                            .position('top right')
                            .theme("warn-toast")
                            .hideDelay(4500)
                        );
                    $rootScope.$emit('deactivateProgressBar');
                  }
              }, function (resp) { //catch error
                  console.log('Error status: ' + resp.data.message);
                  $mdToast.show(
                        $mdToast.simple()
                          .textContent(resp.data.message)
                          .position('top right')
                          .theme("warn-toast")
                          .hideDelay(4500)
                      );
              }, function (evt) {
                  console.log(evt);
              });
          };

          $scope.close = function() {
            $mdDialog.hide();
          }

          function processFile(e) {
              var file = e.target.result,results;
              if (file && file.length) {
                  var results = file;
                  console.log(results)
                  $rootScope.$emit('activateCarouselFromUpload', results);
                  $mdDialog.hide();
              }
          }

        }
      ]);
});
