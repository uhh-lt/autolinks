#!/bin/bash

docker run -p 10010:10010 -p 3001:3001 --rm -ti --name autolinksbrokerdev -v $(pwd):/opt/project -w /opt/project node:9.2.0 bash

npm install swagger -g

# select express
# swagger poject create broker && cd broker

#
swagger project edit -s -p 3001 --host 0.0.0.0

#
swagger project start
