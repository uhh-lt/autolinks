module.exports = function(url, data, token, username, annotation) {
  return {
    url: url + '/storage/annotation/' + data.did,
    method: 'POST',
    headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
       'authorization': token
       },
    json: true,
    body: {
      "type": data.type,
      "doffset": {
        "offsets": [
          {
            "from": annotation.start,
            "length": (annotation.end - annotation.start)
          }
        ]
      },
      "properties": {},
      "analyzer": username
    }
  }
}
