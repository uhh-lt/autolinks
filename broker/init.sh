#!/bin/bash

npm install swagger

# select express
swagger poject create hello-world && cd hello-world

#
swagger project edit -s -p 3001 --host 0.0.0.0

#
swagger project start
