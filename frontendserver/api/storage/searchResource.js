module.exports = function(url, token, query, isCi) {
  return {
    url: url + '/storage/resource/search?q=' + service + '&ci=' + isCi + '&sourcesonly=true',
    method: 'GET',
    headers: {
       'Content-Type': 'application/json',
       'accept': 'application/json',
       'authorization': token
     },
    json: true
  }
}
