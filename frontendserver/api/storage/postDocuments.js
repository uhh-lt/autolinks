var fs = require('fs');
var FormData = require('form-data');

module.exports = function(url, token, file, dir, overwrite) {
  var form = new FormData(file);
  return {
    url: url + '/storage/document?overwrite=' + overwrite,
    method: 'POST',
    headers: {
       "Content-Type": "multipart/form-data",
       "accept": "application/json",
       "authorization": token
     },
    json: true,
    formData: { data: fs.createReadStream(dir + form.name) }
  }
}
