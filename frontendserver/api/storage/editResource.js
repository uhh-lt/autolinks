module.exports = function(url, token, data) {
  const before = data.before;
  let after = data.after;

  var body = getBody(before, after);
  debugger;
  return {
    url: url + '/storage/editresource',
    method: 'POST',
    headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
       'authorization': token
       },
    json: true,
    body: body
  }
}

function getBody(before, after) {
  if (before === null) {
    return {
      "after": getAfter(after).after
    };
  }
  if (after === null) {
    return {
      "before": getBefore(before).before
    };
  }
  return {
    "before": getBefore(before).before,
    "after": getAfter(after).after
  }
};

function getBefore(before) {
  return {
    "before":
    {
        "rid": before.rid,
        "cid": before.cid,
        "metadata": before.metadata ? before.metadata : {},
        "value": before.value ? before.value : {}
    }
  };
};

function getAfter(after) {
  return {
    "after":
    {
        "rid": after.rid,
        "cid": after.cid,
        "metadata": after.metadata ? after.metadata : {},
        "value":   after.value ? after.value : {}
    }
  };
};
