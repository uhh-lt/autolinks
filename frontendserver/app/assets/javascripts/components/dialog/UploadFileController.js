define([
    'angular',
    'jquery',
    'ngFileUpload'
], function(angular) {
    'use strict';
    /**
     * viewer module:
     */
    angular.module('autolinks.upload', ['ngFileUpload']);
    angular.module('autolinks.upload')
        // Viewer Controller
        .controller('UploadFileController', ['Upload', '$window', '$scope', '$rootScope', '$mdDialog', '$q', 'EndPointService', '$mdToast',
        function (Upload, $window, $scope, $rootScope, $mdDialog, $q, EndPointService, $mdToast) {

          var vm = this;
          vm.submit = function(){ //function to call on form submit
              if (vm.upload_form.file.$valid && vm.file) { //check if from is valid
                  vm.upload(vm.file); //call upload function
              }
          }
          vm.upload = function (file) {
              Upload.upload({
                  url: '/api/storage/postDocuments', //webAPI exposed to upload the file
                  data:{ docFile:file } //pass file as data, should be user ng-model
              }).then(function (resp) { //upload function returns a promise
                  if(resp.status === 200) { //validate success
                    $mdToast.show(
                          $mdToast.simple()
                            .textContent('Document ' + resp.data.name + ' with did: ' + resp.data.did + ' is uploaded!')
                            .position('top right')
                            .theme("primary-toast")
                            .hideDelay(3500)
                        );
                      // $window.alert('Success ' + resp.data.name + 'with did: ' + resp.data.did + ' uploaded');
                  } else {
                      $window.alert('an error occured');
                  }
                  $mdDialog.hide();
              }, function (resp) { //catch error
                  console.log('Error status: ' + resp.status);
                  $window.alert('Error status: ' + resp.status);
              }, function (evt) {
                  console.log(evt);
                  var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                  console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                  vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
              });
          };

          $scope.close = function() {
            $mdDialog.hide();
          }

        }
      ]);
});
