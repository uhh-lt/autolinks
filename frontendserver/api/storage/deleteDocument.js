module.exports = function(url, token, docId) {
  return {
    url: url + '/storage/document/' + docId,
    method: 'DELETE',
    headers: {
       "accept": "application/json",
       "authorization": token
     },
    json: true
  }
}
