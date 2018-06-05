module.exports = function(url, token, service) {
  return {
    url: url + '/service/get/' + service,
    method: 'GET',
    headers: {
       'Content-Type': 'application/json',
       'accept': 'application/json',
       'authorization': token
     },
    json: true,
  }
}
