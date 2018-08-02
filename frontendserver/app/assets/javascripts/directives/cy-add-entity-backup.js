function extractResource(n) {
  return n.value.subject;
}

function extractList(n) {
  if (_.isArray(n[0].value)) {
    return extractList(n[0].value);
  }
  if(_.isObject(n[0].value)) {
    return n[0].value.subject;
  }
  return n[0].value;
}

function assignEntity(e, parent, child = false) {
  return {
    cid: e.cid,
    rid: e.rid,
    metadata: e.metadata,
    id: ( e.value + ( child ? '' : '_as_parent' ) + e.rid ).replace(/\s/g, ''),
    name: e.value + '',
    parent: parent ? parent.id : null,
    path: scope.path
  };
}

function assignRelation(r, subject, object) {
  return {
    group: "edges",
    data:
    {
      cid: r.cid,
      rid: r.rid,
      metadata: r.metadata,
      id: ( subject.id + object.id + r.rid ).replace(/\s/g, ''),
      source: (subject.id).replace(/\s/g, ''),
      target: (object.id).replace(/\s/g, ''),
      name: r.value,
      path: scope.path
    }
  };
}

function extractEntity(n, parent = null) {
  let s = n.value.subject;
  let p = n.value.predicate;
  let o = n.value.object;

  if (_.isArray(s.value)) {
    var es = extractList(s.value);
    var subject = assignEntity(es, parent);
  } else if (_.isObject(s.value)) {
    var es = extractResource(s);
    var subject = assignEntity(es, parent);
  } else {
    var subject = assignEntity(s, parent, true);
  }

  if (_.isArray(o.value)) {
    var eo = extractList(o.value);
    var object = assignEntity(eo, parent);
  } else if (_.isObject(o.value)) {
    var eo = extractResource(o);
    var object = assignEntity(eo, parent);
  } else {
    var object = assignEntity(o, parent, true);
  }

  if (_.isArray(p.value)) {
    var ep = extractList(p.value);
    var edge = assignRelation(ep, subject, object);
  } else if (_.isObject(p.value)) {
    var ep = extractResource(p);
    var edge = assignEntity(ep, parent);
  } else {
    var edge = assignRelation(p, subject, object);
  };

  scope.newEdge.push(edge);
  scope.newNode.push(subject, object);

  if (_.isArray(s.value)) {
    _.forEach(s.value, function(n) {
      extractEntity(n, subject);
    });
  } else if (_.isObject(s.value)) {
    extractEntity(s, subject);
  };

  if (_.isArray(o.value)) {
    _.forEach(o.value, function(n) {
      extractEntity(n, object);
    });
  } else if (_.isObject(o.value)) {
    extractEntity(o, object);
  };
};

$rootScope.$on('addEntity', function(event, res) {
  var entity = res.entity;
  var nodes = scope.data.nodes;
  var edges = scope.data.edges;

  scope.path = res.data.endpoint.path;
  scope.newNode = [];
  scope.newEdge = [];

  if (entity) {
    if (_.isArray(entity.value)) {
      _.forEach(entity.value, function(n) {
        extractEntity(n);
      });
    } else if (_.isObject(entity.value)) {
      extractEntity(entity);
    } else {
      return;
    }

    var filterNode = [];
    _.forEach(_.uniqBy(scope.newNode, 'id'), function(n) {
      filterNode.push({
        group: 'nodes',
        data: n,
        position: {
          x: 100 + Math.random() * 100,
          y: 100 + Math.random() * 100
        }
      });
    });

    var n = cy.add(filterNode);
    var e = cy.add(scope.newEdge);

    nodeTipExtension(n);
    edgeTipExtension(e);

    scope.data.nodes = _.union(nodes, filterNode);
    scope.data.edges = _.union(edges, scope.newEdge);
    cy.layout(scope.options.layout).run();
  }
});


elesfn.move = function (struct) {
  var cy = this._private.cy;

  if (struct.source !== undefined || struct.target !== undefined) {
    var srcId = struct.source;
    var tgtId = struct.target;
    var srcExists = cy.hasElementWithId(srcId);
    var tgtExists = cy.hasElementWithId(tgtId);

    if (srcExists || tgtExists) {
      var jsons = this.jsons();

      this.remove();

      for (var i = 0; i < jsons.length; i++) {
        var json = jsons[i];
        var ele = this[i];

        if (json.group === 'edges') {
          if (srcExists) {
            json.data.source = srcId;
          }

          if (tgtExists) {
            json.data.target = tgtId;
          }

          json.scratch = ele._private.scratch;
        }
      }

      return cy.add(jsons);
    }
  } else if (struct.parent !== undefined) {
    // move node to new parent
    var parentId = struct.parent;
    var parentExists = parentId === null || cy.hasElementWithId(parentId);

    if (parentExists) {
      var _jsons = this.jsons();
      var descs = this.descendants();
      var descsEtcJsons = descs.union(descs.union(this).connectedEdges()).jsons();

      this.remove(); // NB: also removes descendants and their connected edges

      for (var _i8 = 0; _i8 < _jsons.length; _i8++) {
        var _json = _jsons[_i8];
        var _ele6 = this[_i8];

        if (_json.group === 'nodes') {
          _json.data.parent = parentId === null ? undefined : parentId;

          _json.scratch = _ele6._private.scratch;
        }
      }

      return cy.add(_jsons.concat(descsEtcJsons));
    }
  }

  return this; // if nothing done
};
