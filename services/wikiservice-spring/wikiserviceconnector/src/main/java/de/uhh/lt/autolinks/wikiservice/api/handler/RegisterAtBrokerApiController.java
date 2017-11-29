package de.uhh.lt.autolinks.wikiservice.api.handler;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import de.uhh.lt.autolinks.wikiservice.BrokerRegistry;
import de.uhh.lt.autolinks.wikiservice.api.model.Broker;
import io.swagger.annotations.ApiParam;
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-10-23T11:30:17.359+02:00")

@Controller
public class RegisterAtBrokerApiController implements RegisterAtBrokerApi {
	

	@Autowired
	private BrokerRegistry brokerRegistry;

    public ResponseEntity<?> registerAtBrokerPost(@ApiParam(value = "object holding the location"  )  @Valid @RequestBody Broker broker) {
    	String url = brokerRegistry.getBrokerURL(broker != null ? broker.getLocation() : null);
    	try{
    		brokerRegistry.registerSelfAt(url);
    		return ResponseEntity.ok().build();
    	}catch(Exception e){
    		return ResponseEntity.badRequest().body(ErrorUtils.error(e, "Service registration failed."));
    	}
    }


}
