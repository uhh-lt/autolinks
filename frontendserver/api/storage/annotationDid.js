module.exports = function(url, data, token, username, annotation) {
  var offsets = [];

  annotation.forEach(function(anno) {
    offsets.push({ "from": anno.start, "length": (anno.end - anno.start) })
  });

  return {
    url: url + '/storage/document/' + data.did + '/addannotation',
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
        "offsets": offsets
      },
      "properties": {},
      "analyzer": username
    }
  }
}
