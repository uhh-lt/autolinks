module.exports = function(url, token, data) {
  const before = data.before;
  let after = data.after;

  if (after !== null) {
    after = {
      "after": {
        "rid": after.rid,
        "cid": after.cid,
        "metadata": after.metadata ? after.metadata : {},
        "value": after.value ? after.value : {}
      }
    };
  }

  return {
    url: url + '/storage/editresource',
    method: 'POST',
    headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
       'authorization': token
       },
    json: true,
    body:
    {
      "before": {
        "rid": before.rid,
        "cid": before.cid,
        "metadata": before.metadata ? before.metadata : {},
        "value": before.value ? before.value : {}
      },
      after
    }
  }
}
