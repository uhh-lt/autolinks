/**
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.uhh.lt.autolinks.wikiservice.api.handler;

import de.uhh.lt.autolinks.wikiservice.api.model.Broker;
import de.uhh.lt.autolinks.wikiservice.api.model.Error;

import io.swagger.annotations.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import javax.validation.constraints.*;
import javax.validation.Valid;
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-10-23T11:30:17.359+02:00")

@Api(value = "registerAtBroker", description = "the registerAtBroker API")
public interface RegisterAtBrokerApi {

    @ApiOperation(value = "manually register this service and its endpoints at autolinks broker service", notes = "returns OK if service was registered ", response = Void.class, tags={ "Admin", })
    @ApiResponses(value = { 
        @ApiResponse(code = 200, message = "empty ok message if registered", response = Void.class),
        @ApiResponse(code = 200, message = "Unexpected error", response = Error.class) })
    
    @RequestMapping(value = "/registerAtBroker",
        produces = { "application/json" }, 
        consumes = { "application/json" },
        method = RequestMethod.POST)
    ResponseEntity<?> registerAtBrokerPost(@ApiParam(value = "object holding the location"  )  @Valid @RequestBody Broker broker);

}
