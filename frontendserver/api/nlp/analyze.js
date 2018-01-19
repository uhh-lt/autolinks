module.exports = function(url, text) {
  return {
    url: url + '/nlp/analyze',
    method: 'POST',
    headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
      //  'authorization': 'Basic am9objpkb2U='
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
