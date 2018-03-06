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
