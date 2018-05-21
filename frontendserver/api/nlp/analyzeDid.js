module.exports = function(url, token, did) {
  return {
    url: url + '/nlp/analyze/' + did + '?refresh=',
    method: 'GET',
    headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
       'authorization': token
       },
    json: true
  }
}
