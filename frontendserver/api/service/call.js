module.exports = function(url, data) {
  const name = data.name;
  const version = data.version;
  const text = data.text;
  const path = data.endpoint.path;
  const method = data.endpoint.method;
  return {
    url: url + '/service/call',
    method: 'POST',
    headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
       'authorization': 'Basic am9objpkb2U='
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
              "from": 0,
              "length": text.length
            }
          ]
        },
        "context": {
          "text": text,
          "source": "string",
          "lang": "string",
          "availabletypes": [
            "string"
          ],
          "annotations": [
            {
              "type": "string",
              "doffset": {
                "offsets": [
                  {
                    "from": 0,
                    "length": 0
                  }
                ]
              },
              "properties": {},
              "analyzer": "string"
            }
          ]
        }
      }
    }
  }
}
