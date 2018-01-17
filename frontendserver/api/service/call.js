module.exports = function(url, text) {
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
      "service": "Wiki",
      "version": "0.0.1",
      "path": "/findarticles",
      "method": "post",
      "data": {
        "focus": {
          "offsets": [
            {
              "from": 0,
              "length": 15
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
