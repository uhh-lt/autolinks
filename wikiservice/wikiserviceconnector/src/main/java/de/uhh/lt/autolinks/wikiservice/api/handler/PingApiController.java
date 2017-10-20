package de.uhh.lt.autolinks.wikiservice.api.handler;

import static de.uhh.lt.autolinks.wikiservice.api.handler.ErrorUtils.error;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import de.uhh.lt.autolinks.wikiservice.es.ElasticRestClient;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-10-20T12:35:54.799+02:00")

@Controller
public class PingApiController implements PingApi {

    public ResponseEntity<?> pingGet() {
    	
    	try{
    		if(ElasticRestClient.ping())
    			return ResponseEntity.ok().build();
    		throw new IllegalStateException("Cluster status is red!");
    	}catch(Exception e){
    		return error(e, "Elasticsearch index is not ready.");
    	}
    	
    	
    }

}
