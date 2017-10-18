FROM docker.elastic.co/elasticsearch/elasticsearch:5.5.2

ARG CUSTOM_UID=1000
ARG CUSTOM_GID=1000
USER root
RUN groupmod -g $CUSTOM_GID elasticsearch && \
    usermod -u $CUSTOM_UID elasticsearch && \
    mv /usr/share/elasticsearch /tmp/silly_acl_hack && \
    mv /tmp/silly_acl_hack /usr/share/elasticsearch && \
    chown -R $CUSTOM_UID:$CUSTOM_GID /usr/share/elasticsearch
USER elasticsearch

RUN bin/elasticsearch-plugin install analysis-icu
RUN bin/elasticsearch-plugin install org.wikimedia.search:extra:5.5.2.3
RUN bin/elasticsearch-plugin install org.wikimedia.search.highlighter:experimental-highlighter-elasticsearch-plugin:5.5.2

# RUN bin/plugin install --batch royrusso/elasticsearch-HQ
# RUN bin/plugin install --batch lmenezes/elasticsearch-kopf
