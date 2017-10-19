package de.uhh.lt.autolinks.wikiservice.es;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.elasticsearch.common.xcontent.NamedXContentRegistry;
import org.elasticsearch.common.xcontent.XContentFactory;
import org.elasticsearch.common.xcontent.XContentParser;
import org.elasticsearch.common.xcontent.XContentType;
import org.elasticsearch.index.query.QueryParseContext;
import org.elasticsearch.search.SearchModule;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.transport.client.PreBuiltTransportClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ElasticClient {
	
	private static String[] __empty_string_array = {};
	
	private static Logger LOG = LoggerFactory.getLogger(ElasticClient.class);
	
	private static ElasticClient _instance;
	
	private TransportClient _client;
	
	private ElasticClient() {
		connectServer();
	}
	
	private void connectServer() {
		Settings.Builder settings = Settings.builder()
		        .put("client.transport.sniff", false);
		
		// set cluster name if present as environment variable
		Optional.ofNullable(System.getenv("CLUSTER_NAME")).map(name -> {
			LOG.info("using cluster '{}' ", name);
			settings.put("cluster.name", name);
			return name;
		}).orElseGet(() -> {
			LOG.warn("no cluster name provided, please provide a cluster name as environment variable with CLUSTER_NAME=myclustername.");
			return null;
		});
		
		_client = new PreBuiltTransportClient(settings.build());
		
		// add servers if present 
		String[] servers = Optional
		  .ofNullable(System.getenv("ELASTICSEARCH_URL"))
		  .map(url -> {
			  // can be multiple urls
			  String[] urls = url.split(",");
			  for(String u : urls){
				  String[] splits = u.split(":");
				  try {
					LOG.info("adding server {} ", u);
					_client.addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName(splits[0]),Integer.parseInt(splits[1])));
				} catch (UnknownHostException e) {
					LOG.error("adding server '{}' failed.", u, e);
					throw new RuntimeException(e);
				}
			  }
			  return urls;
		  }).orElseGet(() -> {
			  try {
				// try default elasticsearch
				LOG.info("adding default server 'elasticsearch'");
				_client.addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName("elasticsearch"), 3000));
				return new String[]{"elasticsearch:3000"};
			} catch (UnknownHostException e) {
				try {
					LOG.warn("adding default server 'elasticsearch' failed");
					// try localhost
					LOG.info("adding localhost server");
					_client.addTransportAddress(new InetSocketTransportAddress(InetAddress.getLocalHost(), 3000));
					return new String[]{"localhost:3000"};
				} catch (UnknownHostException e1) {
					LOG.error("adding 'localhost' failed", e);
					LOG.error("No elasticsearch server available");
					// this is bad, neither a host was specified, elasticsearch is available, and localhost isn't available either
					throw new RuntimeException(e1);
				}
			}			  
		  });
		
		LOG.info("connected to servers: {}", Arrays.toString(servers));

	}
	
	TransportClient getClient(){
		return _client;
	}

	public static ElasticClient get(){
		if(_instance != null)
			return _instance;
		return _instance = new ElasticClient();
	}
	
	public static SearchResponse searchByJsonQuery(String json, String... indices){
		SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
		SearchModule searchModule = new SearchModule(Settings.EMPTY, false, Collections.emptyList());
		try (XContentParser parser = XContentFactory.xContent(XContentType.JSON)
				.createParser(new NamedXContentRegistry(searchModule.getNamedXContents()), json)) {
			searchSourceBuilder.parseXContent(new QueryParseContext(parser));
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		SearchResponse response = get()._client.prepareSearch()
				.setIndices(indices)
				.setSource(searchSourceBuilder).get();
		return response;
	}
		
	public static SearchResponse searchByJsonQuery(String json, List<String> indices){
		return indices == null ? searchByJsonQuery(json) : searchByJsonQuery(json, indices.toArray(__empty_string_array));
	}
	
}
