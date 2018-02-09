module.exports = function(url, data) {
  debugger;
  const before = data.before;
  const after = data.after;
  return {
    url: url + '/storage/editresource',
    method: 'POST',
    headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
       'authorization': 'Basic am9objpkb2U='
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
      "after": {
        "rid": after.rid,
        "cid": after.cid,
        "metadata": after.metadata ? after.metadata : {},
        "value": after.value ? after.value : {}
      }
    }
  }
}
