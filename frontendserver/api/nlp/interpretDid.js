module.exports = function(url, token, data) {
  return {
    url: url + '/nlp/interpret/' + parseInt(data.did),
    method: 'POST',
    headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
       'authorization': token
       },
    json: true,
    body: {
          "offsets": [
            {
              "from": data.offsets ? parseInt(data.offsets[0]) : 0,
              "length": data.offsets ? (parseInt(data.offsets[1]) - parseInt(data.offsets[0])) : 0
            }
          ]
        }
  }
}
