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
              Upload.upload({
                  url: '/api/storage/postDocuments', //webAPI exposed to upload the file
                  data:{ docFile: file, overwrite } //pass file as data, should be user ng-model
              }).then(function (resp) { //upload function returns a promise
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
                      // $window.alert('Success ' + resp.data.name + 'with did: ' + resp.data.did + ' uploaded');
                  } else {
                      // $window.alert(resp.data.message);
                    $mdToast.show(
                          $mdToast.simple()
                            .textContent(resp.data.message)
                            .position('top right')
                            .theme("warn-toast")
                            .hideDelay(4500)
                        );
                  }
                  // var file = $('#docFile');
                  //
                  // console.log(file);
                  // console.dir(file);
                  //
                  // if (!window.FileReader) {
                  //     alert('Your browser is not supported')
                  // }
                  // var input = file.get(0);
                  //
                  // // Create a reader object
                  // var reader = new FileReader();
                  // if (input.files.length) {
                  //     var textFile = input.files[0];
                  //     reader.readAsText(textFile);
                  //     $timeout( function(){
                  //         $rootScope.$emit('activateCarouselFromUpload', reader.result);
                  //     }, 500 );
                  //     $mdDialog.hide();
                  //     // $(reader).on('load', processFile);
                  // } else {
                  //     alert('Please upload a file before continuing')
                  // }
                  $mdDialog.hide();
              }, function (resp) { //catch error
                  console.log('Error status: ' + resp.data.message);
                  // $window.alert('Error status: ' + resp.data.message);
                  $mdToast.show(
                        $mdToast.simple()
                          .textContent(resp.data.message)
                          .position('top right')
                          .theme("warn-toast")
                          .hideDelay(4500)
                      );
              }, function (evt) {
                  console.log(evt);
                  //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                  //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                  // vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
              });
          };

          $scope.close = function() {
            $mdDialog.hide();
          }

          function processFile(e) {
              var file = e.target.result,results;
              if (file && file.length) {
                  // results = file.split("\n");
                  var results = file;
                  console.log(results)
                  // $('#text-card').text(function() {
                  //   return results;
                  // });
                  $rootScope.$emit('activateCarouselFromUpload', results);
                  // val(results[0]);
                  // $('#age').val(results[1]);
                  $mdDialog.hide();
              }
          }

        }
      ]);
});
