package de.uhh.lt.autolinks.wikiservice.api.handler;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import javax.validation.Valid;

import org.elasticsearch.action.search.SearchResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import de.uhh.lt.autolinks.wikiservice.api.model.Query;
import de.uhh.lt.autolinks.wikiservice.api.model.RDFtriple;
import de.uhh.lt.autolinks.wikiservice.es.ElasticClient;
import de.uhh.lt.autolinks.wikiservice.es.ElasticRestClient;
import de.uhh.lt.autolinks.wikiservice.es.ElasticRestClient.SearchResponseREST;
import io.swagger.annotations.ApiParam;
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-10-19T16:54:32.234+02:00")

@Controller
public class FindApiController implements FindApi {

	private static boolean _use_rest_client = true;
	
	private static ObjectMapper _om = new ObjectMapper();
	
	private static String _default_query = "{\"query\":{\"match_all\":{}}}";
	private static String[] _default_wiki = {};

    public ResponseEntity<List<RDFtriple>> findPost(@ApiParam(value = "Forwarded elasticsearch query dsl"  )  @Valid @RequestBody Query query) {
    	
    	String query_as_json = _default_query;
    	String[] wiki = _default_wiki;
    	
    	if(query != null){
    		if(query.getQuery() != null)
    			if(query.getQuery() instanceof Map && !((Map<?,?>)query.getQuery()).isEmpty())
					try {
						query_as_json = _om.writeValueAsString(query.getQuery());
					} catch (JsonProcessingException e) {
						// TODO: LOG proper error
						e.printStackTrace();
						return ResponseEntity.badRequest().build();
					}
    		if(query.getWiki() != null)
    			wiki = query.getWiki().toArray(_default_wiki);
    	}
    	
    	List<RDFtriple> triples = null;
    	if(!_use_rest_client){
    		SearchResponse response = ElasticClient.searchByJsonQuery(query_as_json, wiki);
    		triples = prepareResultTriplesFromSearchResponseTC(response);
    	}else{
    		SearchResponseREST response;
			try {
				response = ElasticRestClient.searchByJsonQuery(query_as_json, wiki);
			} catch (IOException e) {
				// TODO log proper error
				e.printStackTrace();
				return ResponseEntity.badRequest().build();
			}
    		triples = prepareResultTriplesFromSearchResponseREST(response);
    	}

   	 return ResponseEntity
        		.ok()
        		.contentType(MediaType.APPLICATION_JSON)
        		.body(triples);
    }

	private List<RDFtriple> prepareResultTriplesFromSearchResponseTC(SearchResponse response) {
	  	List<RDFtriple> triples = StreamSupport.stream(response.getHits().spliterator(), false)
	    		.map(hit -> 
		    		new RDFtriple(){{
						subject(String.valueOf(hit.getId()));
						predicate("has_source");
						object(hit.getSourceAsString());
	    				properties(Arrays.asList(
						new RDFtriple(){{
		    				subject("_");
		    				predicate("type_of");
		    				object(hit.getType());
						}},
						new RDFtriple(){{
		    				subject("_");
		    				predicate("found_in");
		    				object(String.valueOf(hit.getIndex()));
						}},
						new RDFtriple(){{
		    				subject("_");
		    				predicate("has_score");
		    				object(String.valueOf(hit.getScore()));
						}}
						));
				}})
	    		.collect(Collectors.toList());
	  	return triples;
	}
	
	private List<RDFtriple> prepareResultTriplesFromSearchResponseREST(SearchResponseREST response) {
	  	List<RDFtriple> triples = response.hits.hits.stream()
	    		.map(hit -> 
		    		new RDFtriple(){{
						subject(String.valueOf(hit.id));
						predicate("has_source");
						object(hit.getSourceAsString());
	    				properties(Arrays.asList(
						new RDFtriple(){{
		    				subject("_");
		    				predicate("type_of");
		    				object(hit.type);
						}},
						new RDFtriple(){{
		    				subject("_");
		    				predicate("found_in");
		    				object(String.valueOf(hit.index));
						}},
						new RDFtriple(){{
		    				subject("_");
		    				predicate("has_score");
		    				object(String.valueOf(hit.score));
						}}
						));
				}})
	    		.collect(Collectors.toList());
	  	return triples;
	}

}
