package de.uhh.lt.autolinks.wikiservice.es;

import java.io.IOException;
import java.util.HashMap;

import org.apache.http.util.EntityUtils;
import org.elasticsearch.client.Response;
import org.elasticsearch.client.ResponseListener;
import org.elasticsearch.client.RestClient;
import org.junit.Test;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.javafx.collections.MappingChange.Map;

public class ElasticRestClientTest {
	
	String[] source_include = {"title", "text"};
	String[] empty = new String[0];
	
	ObjectMapper om = new ObjectMapper();
	
	@Test
	public void testSearch() throws IOException{
		RestClient client = ElasticRestClient.get().getClient();
		Response r = client.performRequest("GET", "_cluster/health");
		r.getEntity().writeTo(System.out);
		
		r = client.performRequest("GET", "_search", new HashMap<String,String>(){{put("q","*");}});
		HashMap m = om.readValue(r.getEntity().getContent(), HashMap.class);
		
		System.out.println(m);
		
		String json = om.writeValueAsString(m.get("hits"));
		System.out.println(json);
		
//		
//		
//		
//		SearchResponse response = client.prepareSearch()
//				.setIndices("simplewiki")
//				.setFetchSource(source_include, empty)
//				.setSize(10)
//				.get();
//		System.out.println(response.getHits().getTotalHits());
//		System.out.println(response.getHits().getMaxScore());
//		StreamSupport.stream(response.getHits().spliterator(), false).limit(10).forEach(hit -> {
//			System.out.format("\t%s %s %s %n", hit.getId(), hit.docId(), hit.getSourceAsMap());
//			System.out.println("\t\t" + hit.getSource());
//		});
	}
	
	
//	
//	@Test
//	public void testSearchWithJsonquery(){
//		
//		String content = "{\"query\":{\"match_all\":{}}}";
//		
//		SearchResponse response = ElasticClient.searchByJsonQuery(content);			
//		System.out.println(response.getHits().getTotalHits());
//		System.out.println(response.getHits().getMaxScore());
//		
//		
//		content = "{\"query\":{\"query_string\" : { \"query\" : \"jaguar\" } } }";
//		
//		response = ElasticClient.searchByJsonQuery(content, "simplewiki");
//		System.out.println(response.getHits().getTotalHits());
//		System.out.println(response.getHits().getMaxScore());
//
//		
//		
//	}
	
}
