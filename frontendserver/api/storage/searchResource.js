module.exports = function(url, token, data) {
  return {
    url: url + '/storage/resource/search?q=' + data.context + '&ci=' + data.isCi + '&sourcesonly=true',
    method: 'GET',
    headers: {
       'Content-Type': 'application/json',
       'accept': 'application/json',
       'authorization': token
     },
    json: true
  }
}
