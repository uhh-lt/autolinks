package de.uhh.lt.autolinks.wikiservice.api.handler;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import de.uhh.lt.autolinks.wikiservice.api.model.Error;

public class ErrorUtils {
	
	private ErrorUtils(){ /* DO NOT INSTANTIATE */ }

	public static ResponseEntity<Error> error(Throwable t, String message){
		return error(
				-1, 
				String.format("%s: %s", t.getClass().getName(), t.getMessage()), 
				message, 
				condenseToErrorString(t.getCause()));
	}

	public static String condenseToErrorString(Throwable t){
		StringBuilder b = new StringBuilder(); 
		for(;t != null; t = t.getCause()){
			b
			.append(" ::: ")
			.append(t.getClass().getName())
			.append(": ")
			.append(t.getMessage());
		}
		if(b.length() > 0)
			return b.substring(5);
		return b.toString();
	}

	public static ResponseEntity<Error> error(int code, String type, String message, String cause) {
		return ResponseEntity
				.badRequest()
				.contentType(MediaType.APPLICATION_JSON)
				.body(new Error(){{
					code(-1);
					type(type);
					message(message);
					cause(cause);
				}});
	}

}
