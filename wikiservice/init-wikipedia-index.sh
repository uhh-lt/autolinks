#!/bin/bash

##
# based on https://www.elastic.co/blog/loading-wikipedia
##

# bring up elastic search
docker-compose up -d

# set some variables
es=localhost:9200

# set up simplewikipedia
wikiname=simplewiki
site=simple.wikipedia.org
index=$wikiname

# set up english wiki quote
# wikiname=enwikiquote
# site=en.wikiquote.org
# index=$wikiname

# set up english wikipedia
# wikiname=enwiki
# site=en.wikipedia.org
# index=$wikiname

# set up wiki data
# wikiname=wikidatawiki
# site=wikidata.org
# index=wikidata

# set up english wiktionary
# wikiname=enwiktionary
# site=en.wiktionary.org
# index=$wikiname

# the content dump file
dump=$wikiname-20171023-cirrussearch-content.json.gz
# or the general dump file, which contains user discussions and so on
# dump=$wikiname-20171009-cirrussearch-general.json.gz

# prepare directory for temporary files
mkdir -p temp/

# download index (https://dumps.wikimedia.org/other/cirrussearch/)
# https://dumps.wikimedia.org/other/cirrussearch/current/
[ ! -e temp/$dump ] && curl 'https://dumps.wikimedia.org/other/cirrussearch/20171023/'$dump > temp/$dump

# use dump from the creation of this script
# curl -s 'https://dumps.wikimedia.org/other/cirrussearch/20171009/'$dump > temp/$dump

# extract the dump and prepare data chunks (chunks/u will contain unindexed files, chunks/f will contain finished files)
mkdir -p temp/chunks/u && mkdir -p temp/chunks/f && cat temp/$dump | gzip -c -d | split -a 10 -l 500 - temp/chunks/u/${index}_

# delete index (just to be sure it doesn't exist)
curl -s -XDELETE $es/$index?pretty

# dump current settings
curl 'https://'$site'/w/api.php?action=cirrus-settings-dump&format=json&formatversion=2' > temp/settings.json

# dump current mappings
curl 'https://'$site'/w/api.php?action=cirrus-mapping-dump&format=json&formatversion=2' > temp/mappings.json

# create index with settings (reformat cirrus dump to elasticsearch v5.5.2 settings)
# use settings from the creation of this script: cat settings201710.json
cat temp/settings.json |
  jq '{
    settings: {
      analysis: .content.page.index.analysis,
      index: {
        similarity: .content.page.index.similarity,
      }
    },
    number_of_shards: 1,
    number_of_replicas: 0
  }' |
  curl -H 'Content-Type: application/json' -XPUT $es/$index?pretty -d @-

# add mappings to index (reformat cirrus dump to elasticsearch v5.5.2 mappings)
# use mappings from the creation of this script: cat mappings201710.json
cat temp/mappings.json |
  sed 's/"index_analyzer"/"analyzer"/' |
  sed 's/"position_offset_gap"/"position_increment_gap"/' |
  jq '.content.page' |
  curl -H 'Content-Type: application/json' -XPUT $es/$index/_mapping/page?pretty -d @-

# import the data
for file in temp/chunks/u/${index}_*; do
  echo -n "${file}:  "
  took=$(curl -H 'Content-Type: application/json' -s -XPOST $es/$index/_bulk?pretty --data-binary @$file |
    grep took | cut -d':' -f 2 | cut -d',' -f 1)
  printf '%7s\n' $took
  [ "x$took" = "x" ] || mv $file temp/chunks/f/
done

# speed up, enter in a different terminal
# curl -XPUT "$es/$index/_settings?pretty" -d '{ "index" : { "refresh_interval" : -1 } }'

# monitor progress, enter in a different terminal
# date; curl $es/$index/_refresh?pretty; curl $es/$index/_count?pretty

# is the index fixed? optimize it! Note: this is bad if the index is updated!
# curl -XPOST "$es/$index/_forcemerge?max_num_segments=1"
