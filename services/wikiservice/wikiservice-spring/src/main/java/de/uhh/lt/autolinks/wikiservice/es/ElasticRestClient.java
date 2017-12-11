package de.uhh.lt.autolinks.wikiservice.es;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.entity.ContentType;
import org.apache.http.nio.entity.NStringEntity;
import org.elasticsearch.client.Response;
import org.elasticsearch.client.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ElasticRestClient {
	
	private static String[] __empty_string_array = {};
	
	private static Map<String, String> _empty_map = Collections.emptyMap();
	
	private static Logger LOG = LoggerFactory.getLogger(ElasticRestClient.class);
	
	private static ElasticRestClient _instance;
	
	private RestClient _client;
	
	private static ObjectMapper _om = new ObjectMapper();
	
	private ElasticRestClient() {
		connectServer();
	}
	
	private void connectServer() {

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
	
	Map<String, String> m = Collections.emptyMap();
	
	public static SearchResponseREST searchByJsonQuery(String json, String... indices) throws IOException{
		String endpoint = "/_search";
		if(indices.length > 0)
			endpoint = "/" + String.join(",", indices) + "/_search";
		HttpEntity body = new NStringEntity(json, ContentType.APPLICATION_JSON);
		Response r = get()._client.performRequest("POST", endpoint, _empty_map, body);
		SearchResponseREST sr = _om.readValue(r.getEntity().getContent(), SearchResponseREST.class);
		return sr;
	}
		
	public static SearchResponseREST searchByJsonQuery(String json, List<String> indices) throws IOException{
		return indices == null ? searchByJsonQuery(json) : searchByJsonQuery(json, indices.toArray(__empty_string_array));
	}
	
	public static boolean ping() throws IOException{
		String endpoint = "/_cluster/health";
		Response r = get()._client.performRequest("GET", endpoint, _empty_map);
		HashMap<?,?> sr = _om.readValue(r.getEntity().getContent(), HashMap.class);
		Object status = sr.get("status");
		return status != null && !"red".equals(status.toString());
	}
	
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class SearchResponseREST {
	    @JsonProperty
		public SearchResponseHitsREST hits;
	}
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class SearchResponseHitsREST {
	    @JsonProperty
	    public int total;
	    @JsonProperty
	    public List<SearchResponseHitREST> hits;
	}
	public static class SearchResponseHitREST {
	    @JsonProperty(value = "_index")
	    public String index;
	 
	    @JsonProperty(value = "_type")
	    public String type;
	 
	    @JsonProperty(value = "_id")
	    public String id;
	 
	    @JsonProperty(value = "_score")
	    public Double score;
	 
	    @JsonProperty(value = "_source")
	    public LinkedHashMap<String, Object> source;
	    
	    public String getSourceAsString(){
	    	try {
				return _om.writeValueAsString(source);
			} catch (JsonProcessingException e) {
				/* this should be a safe method, nothing should happen here */
				e.printStackTrace();
				return "{}";
			}
	    }
	}
	
}
