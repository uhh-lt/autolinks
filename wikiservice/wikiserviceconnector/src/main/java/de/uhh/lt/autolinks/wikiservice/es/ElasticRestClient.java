package de.uhh.lt.autolinks.wikiservice.es;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.apache.http.HttpHost;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.Response;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.common.settings.Settings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ElasticRestClient {
	
	private static String[] __empty_string_array = {};
	
	private static Logger LOG = LoggerFactory.getLogger(ElasticRestClient.class);
	
	private static ElasticRestClient _instance;
	
	private RestClient _client;
	
	private ElasticRestClient() {
		connectServer();
	}
	
	private void connectServer() {
//		Settings.Builder settings = Settings.builder()
//		        .put("client.transport.sniff", false);
//		
//		// set cluster name if present as environment variable
//		Optional.ofNullable(System.getenv("CLUSTER_NAME")).map(name -> {
//			LOG.info("using cluster '{}' ", name);
//			settings.put("cluster.name", name);
//			return name;
//		}).orElseGet(() -> {
//			LOG.warn("no cluster name provided, please provide a cluster name as environment variable with CLUSTER_NAME=myclustername.");
//			return null;
//		});
//		
//		 
		
		// add servers if present 
		HttpHost[] servers = 
				Optional
		  .ofNullable(System.getenv("ELASTICSEARCH_URL"))
		  .map(url -> {
			  // can be multiple urls
			  String[] urls = url.split(",");
			  HttpHost[] hosts = new HttpHost[urls.length];
			  for(int i = 0; i < urls.length; i++)
				  hosts[i] =  HttpHost.create(urls[i]);
			  return hosts;
		  })
		  .orElseGet(() -> {
				// try default elasticsearch
				LOG.info("adding default server 'elasticsearch'");
				return new HttpHost[]{new HttpHost("elasticsearch", 9200, "http")};
		  });
		_client = RestClient.builder(servers).build();
		
		try {
			_client.performRequest("GET", "_cluster/health");
		} catch (IOException e) {
			LOG.info("trying server 'localhost'");
			servers = new HttpHost[]{ new HttpHost("localhost", 9200, "http") };
			_client.setHosts(servers);
			try {
				_client.performRequest("GET", "_cluster/health");
			} catch (IOException e1) {
				// this is bad, neither a host was specified, elasticsearch is available, and localhost isn't available either
				throw new RuntimeException(e1);
			}
		}
		
		LOG.info("connected to servers: {}", Arrays.toString(servers));

	}
	
	RestClient getClient(){
		return _client;
	}

	public static ElasticRestClient get(){
		if(_instance != null)
			return _instance;
		return _instance = new ElasticRestClient();
	}
	
	public static SearchResponse searchByJsonQuery(String json, String... indices){
//		SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
//		SearchModule searchModule = new SearchModule(Settings.EMPTY, false, Collections.emptyList());
//		try (XContentParser parser = XContentFactory.xContent(XContentType.JSON)
//				.createParser(new NamedXContentRegistry(searchModule.getNamedXContents()), json)) {
//			searchSourceBuilder.parseXContent(new QueryParseContext(parser));
//		} catch (IOException e) {
//			e.printStackTrace();
//		}
//		
//		SearchResponse response = get()._client.prepareSearch()
//				.setIndices(indices)
//				.setSource(searchSourceBuilder).get();
//		Searc
		return null;
	}
		
	public static SearchResponse searchByJsonQuery(String json, List<String> indices){
		return indices == null ? searchByJsonQuery(json) : searchByJsonQuery(json, indices.toArray(__empty_string_array));
	}
	
}
