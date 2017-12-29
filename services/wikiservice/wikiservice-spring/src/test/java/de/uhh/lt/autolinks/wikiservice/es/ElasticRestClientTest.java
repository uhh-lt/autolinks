package de.uhh.lt.autolinks.wikiservice.es;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.apache.http.HttpEntity;
import org.apache.http.entity.ContentType;
import org.apache.http.nio.entity.NStringEntity;
import org.elasticsearch.client.Response;
import org.elasticsearch.client.RestClient;
import org.junit.Test;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import de.uhh.lt.autolinks.wikiservice.es.ElasticRestClient.SearchResponseREST;

public class ElasticRestClientTest {
	
	String[] empty = new String[0];
	
	ObjectMapper om = new ObjectMapper();
	
	@SuppressWarnings("serial")
	@Test
	public void testSearch() throws IOException{
		RestClient client = ElasticRestClient.get().getClient();
		Response r = client.performRequest("GET", "_cluster/health");
		r.getEntity().writeTo(System.out);
		
		r = client.performRequest("GET", "_search", new HashMap<String,String>(){{put("q","*");}});
		HashMap<?,?> m = om.readValue(r.getEntity().getContent(), HashMap.class);
		System.out.println(m);
		
		String json = om.writeValueAsString(m.get("hits"));
		System.out.println(json);
		
		r = client.performRequest("GET", "_search", new HashMap<String,String>(){{put("q","*");}});
		SearchResponseREST resp = om.readValue(r.getEntity().getContent(), SearchResponseREST.class);
		System.out.println(resp);
		System.out.println(resp.hits.hits.get(0).source);
	}
	
	
	
	@Test
	public void testSearchWithJsonquery() throws JsonParseException, JsonMappingException, IOException, InterruptedException{
		
		RestClient client = ElasticRestClient.get().getClient();
		
		String content = "{\"query\":{\"match_all\":{}}}";
		HttpEntity t = new NStringEntity(content, ContentType.APPLICATION_JSON);
		Map<String, String> m = Collections.emptyMap();
		
		Response r = client.performRequest("POST", "_search", m, t);
		r.getEntity().writeTo(System.out);		
		System.out.println();
		System.out.println();
		System.out.println();
		
		content = "{\"query\":{\"query_string\" : { \"query\" : \"jaguar\" } } }";
		t = new NStringEntity(content, ContentType.APPLICATION_JSON);
		r = client.performRequest("POST", "simplewiki/_search", m, t);
		r.getEntity().writeTo(System.out);
		

		
		
	}
	
}
