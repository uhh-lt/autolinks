module.exports = function(url, token, text) {
  return {
    url: url + '/nlp/analyze',
    method: 'POST',
    headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
       'authorization': token
       },
    json: true,
    body:
    {
      "data": text,
      "content-type": "string",
      "source": "string"
    }
  }
}
