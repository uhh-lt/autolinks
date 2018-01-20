$rootScope.$on('addEntity', function(event, entity){
  var nodes = scope.data.nodes;
  var edges = scope.data.edges;
  var newNode = [];
  var newEdge = [];

  if (entity) {
    _.forEach(entity, function(n) {
      function extractEntity(n, parent = null) {
        function extractSubject(n) {
          if (_.isArray(n.subject)) {
            return extractSubject(n.subject[0]);
          }
          return n;
        }

        function extractObject(n) {
          if (_.isArray(n.object)) {
            return extractSubject(n.object[0]);
          }
          return n;
        }

        function extractPredicate(n) {
          if (_.isArray(n.predicate)) {
            return extractSubject(n.predicate[0]);
          }
          return n;
        }

        if (_.isArray(n.subject)) {
          var s = extractSubject(n);
          var subject = {
              id: (s.subject + '_as_parent').replace(/\s/g, ''),
              name: s.subject,
              parent: parent ? parent.id : null
          };
        } else {
          var subject = {
              id: (n.subject).replace(/\s/g, ''),
              name: n.subject,
              parent: parent ? parent.id : null
          };
        }

        if (_.isArray(n.object)) {
          var o = extractObject(n);
          var object = {
              id: (o.subject + '_as_parent').replace(/\s/g, ''),
              name: o.subject,
              parent: parent ? parent.id : null
          };
        } else {
          var object = {
              id: (n.object).replace(/\s/g, ''),
              name: n.object,
              parent: parent ? parent.id : null
          };
        }

        if (_.isArray(n.predicate)) {
          var p = extractPredicate(n);
          var edge = {
            group: "edges",
            data:
            {
              id: ( subject.id + object.id ).replace(/\s/g, ''),
              source: (subject.name).replace(/\s/g, ''),
              target: (object.name).replace(/\s/g, ''),
              name: p.subject
            }
          }
        } else {
          var edge = {
            group: "edges",
            data:
            {
              id: ( subject.id + object.id ).replace(/\s/g, ''),
              source: (subject.name).replace(/\s/g, ''),
              target: (object.name).replace(/\s/g, ''),
              name: n.predicate
            }
          };
        }

        newEdge.push(edge);
        newNode.push(subject, object);

        if (_.isArray(n.subject)) {
          _.forEach(n.subject, function(n) {
            extractEntity(n, subject);
          });
        };

        if (_.isArray(n.object)) {
          _.forEach(n.object, function(n) {
            extractEntity(n, object);
          });
        };
      }
      extractEntity(n);
    });

    var filterNode = [];
    _.forEach(_.uniqBy(newNode, 'id'), function(n) {
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
    var e = cy.add(newEdge);

    nodeTipExtension(n);
    edgeTipExtension(e);

    scope.data.nodes = _.union(nodes, filterNode);
    scope.data.edges = _.union(edges, newEdge);
    cy.layout(scope.options.layout).run();
  }
});
