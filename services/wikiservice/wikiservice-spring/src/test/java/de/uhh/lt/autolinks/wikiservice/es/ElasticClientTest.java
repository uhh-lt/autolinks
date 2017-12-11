package de.uhh.lt.autolinks.wikiservice.es;

import java.util.stream.StreamSupport;

import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.transport.TransportClient;
import org.junit.Test;

public class ElasticClientTest {
	
	String[] source_include = {"title", "text"};
	String[] empty = new String[0];
	
	@Test
	public void testSearch(){
		TransportClient client = ElasticClient.get().getClient();
		
		SearchResponse response = client.prepareSearch()
				.setIndices("simplewiki")
				.setFetchSource(source_include, empty)
				.setSize(10)
				.get();
		System.out.println(response.getHits().getTotalHits());
		System.out.println(response.getHits().getMaxScore());
		StreamSupport.stream(response.getHits().spliterator(), false).limit(10).forEach(hit -> {
			System.out.format("\t%s %s %s %n", hit.getId(), hit.docId(), hit.getSourceAsMap());
			System.out.println("\t\t" + hit.getSource());
		});
	}
	
	
	
	@Test
	public void testSearchWithJsonquery(){
		
		String content = "{\"query\":{\"match_all\":{}}}";
		
		SearchResponse response = ElasticClient.searchByJsonQuery(content);			
		System.out.println(response.getHits().getTotalHits());
		System.out.println(response.getHits().getMaxScore());
		
		
		content = "{\"query\":{\"query_string\" : { \"query\" : \"jaguar\" } } }";
		
		response = ElasticClient.searchByJsonQuery(content, "simplewiki");
		System.out.println(response.getHits().getTotalHits());
		System.out.println(response.getHits().getMaxScore());

		
		
	}
	
}
