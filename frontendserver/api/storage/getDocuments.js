module.exports = function(url, token) {
  return {
    url: url + '/storage/document?detailed=true',
    method: 'GET',
    headers: {
       'Content-Type': 'application/json',
       'accept': 'application/json',
       'authorization': token
     },
    json: true
  }
}
