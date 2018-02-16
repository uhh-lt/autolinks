module.exports = function(url, token, data) {
  const name = data.name;
  const version = data.version;
  const context = data.context;
  const offsets = data.offsets;
  const path = data.endpoint.path;
  const method = data.endpoint.method;
  return {
    url: url + '/service/call',
    method: 'POST',
    headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
       'authorization': token
     },
    json: true,
    body:
    {
      "service": name,
      "version": version,
      "path": path,
      "method": method,
      "data": {
        "focus": {
          "offsets": [
            {
              "from": offsets.from,
              "length": offsets.length
            }
          ]
        },
        "context": context
      }
    }
  }
}
