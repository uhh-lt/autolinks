module.exports = function(url, token, docId) {
  return {
    url: url + '/storage/document/' + docId,
    method: 'DELETE',
    headers: {
       "Content-Type": "multipart/form-data",
       "accept": "application/json",
       "authorization": token
     },
    json: true
  }
}
