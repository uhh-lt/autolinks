package de.uhh.lt.autolinks.wikiservice.api.handler;

import de.uhh.lt.autolinks.wikiservice.api.model.Error;
import de.uhh.lt.autolinks.wikiservice.api.model.RDFtriple;
import de.uhh.lt.autolinks.wikiservice.es.ElasticClient;
import io.swagger.annotations.*;

import org.elasticsearch.action.search.SearchResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import javax.validation.constraints.*;
import javax.validation.Valid;
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-10-18T08:06:37.619+02:00")

@Controller
public class FindApiController implements FindApi {



    public ResponseEntity<List<RDFtriple>> findPost(@ApiParam(value = "Which wiki to use:    - enwiki   - simplewiki   - wikidata   - enwiktionary default: * ") @RequestParam(value = "wiki", required = false) List<String> wiki,
        @ApiParam(value = "Forwarded elasticsearch query dsl"  )  @Valid @RequestBody String query) {
SearchResponse response = ElasticClient.searchByJsonQuery(query, wiki);
    	
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

   	 return ResponseEntity
        		.ok()
        		.contentType(MediaType.APPLICATION_JSON)
        		.body(triples);
   	 
    }

}
