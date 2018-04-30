var fs = require('fs');
var FormData = require('form-data');

module.exports = function(url, token, file) {
  var form = new FormData(file);
  // form.append('doc', file, file.name); //TODO: in the case of multiple files
  return {
    url: url + '/storage/document?overwrite=true',
    method: 'POST',
    headers: {
       "Content-Type": "multipart/form-data",
       "accept": "application/json",
       "authorization": token
     },
    json: true,
    formData: { data: form }
  }
}
