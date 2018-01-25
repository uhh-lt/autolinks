module.exports = function(url, text) {
  return {
    url: url + '/storage/editresource',
    method: 'POST',
    headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
       },
    json: true,
    body:
    {
      {
        "before": {
          "rid": 0,
          "cid": 0,
          "metadata": {},
          "value": {}
        },
        "after": {
          "rid": 0,
          "cid": 0,
          "metadata": {},
          "value": {}
        }
      }
    }
  }
}
