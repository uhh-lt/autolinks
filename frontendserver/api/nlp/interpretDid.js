module.exports = function(url, token, did) {
  return {
    url: url + '/nlp/interpret/' + did,
    method: 'POST',
    headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
       'authorization': token
       },
    json: true,
    body:
    {
      "offsets": [
        {
          "from": 0,
          "length": 1000000
        }
      ]
    }
  }
}
