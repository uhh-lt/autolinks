module.exports = function(url, token, source) {
  return {
    url: url + '/storage/resource/get?key=' + source,
    method: 'GET',
    headers: {
       'Content-Type': 'application/json',
       'accept': 'application/json',
       'authorization': token
     },
    json: true
  }
}
