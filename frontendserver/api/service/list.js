module.exports = function(url) {
  return {
    url: url + '/service/listServices',
    method: 'GET',
    headers: {
       'Content-Type': 'application/json',
       'accept': 'application/json'
     },
    json: true,
  }
}
