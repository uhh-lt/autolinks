define([
    'angular',
    'jquery'
], function(angular) {
    'use strict';
    /**
     * viewer module:
     */
    angular.module('autolinks.upload', []);
    angular.module('autolinks.upload')
        // Viewer Controller
        .controller('UploadFileController', ['$scope', '$mdDialog', '$q', function ($scope, $mdDialog, $q) {

          $scope.close = function() {
            $mdDialog.hide();
          }

          $scope.fileUpload = function() {
            var file = $('#txtFile');

            console.log(file);
            console.dir(file);

            if (!window.FileReader) {
                alert('Your browser is not supported')
            }
            var input = file.get(0);

            // Create a reader object
            var reader = new FileReader();
            if (input.files.length) {
                var textFile = input.files[0];
                reader.readAsText(textFile);
                $(reader).on('load', processFile);
            } else {
                alert('Please upload a file before continuing')
            }
          }

          function processFile(e) {
              var file = e.target.result,results;
              if (file && file.length) {
                  results = file.split("\n");
                  console.log(results)
                  $('#text-card').text(function() {
                    return results;
                  });
                  // val(results[0]);
                  // $('#age').val(results[1]);
                  $mdDialog.hide();
              }
          }

        }
      ]);
});
