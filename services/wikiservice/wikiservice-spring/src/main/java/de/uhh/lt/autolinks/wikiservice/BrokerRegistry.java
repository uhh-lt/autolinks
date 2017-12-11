package de.uhh.lt.autolinks.wikiservice;

import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;

import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

import de.uhh.lt.autolinks.wikiservice.api.model.Endpoint;
import de.uhh.lt.autolinks.wikiservice.api.model.Service;


@org.springframework.stereotype.Service
public class BrokerRegistry {

	private static Logger LOG = LoggerFactory.getLogger(BrokerRegistry.class);

	private boolean isRegistered = false;
	
	private ObjectMapper om = new ObjectMapper();

	public Service wikiservice;

	@Autowired
	public BrokerRegistry(Environment environment) {
		//	    String port = environment.getProperty("local.server.port");
		String port = environment.getProperty("server.port");
		String host = null;
		try {
			//			InetAddress.getLocalHost().getHostAddress();
			host = InetAddress.getLocalHost().getHostName();
		} catch (UnknownHostException e) {
			host = InetAddress.getLoopbackAddress().getHostAddress();
			LOG.warn("",e);
		}
		String path = environment.getProperty("server.contextPath");
		String url = String.format("http://%s:%s%s", host, port, path);
		LOG.info("Service is available at '{}'.", url);


		wikiservice = new Service();
		wikiservice.name("wikiservice");
		wikiservice.location(url);
		wikiservice.description("");
		wikiservice.endpoints(Arrays.asList(
				new Endpoint(){{
					name("find");
					servicename(wikiservice.getName());
					requireslogin(false);
				}}
			));

	}


	public String getBrokerURL(String location){
		String url = null;
		if(StringUtils.isEmpty(location))
			url = getSystemBrokerURL();
		else
			url = location;
		if(!url.endsWith("/registerService"))
			url = url + "/registerService";
		return url;
	}

	public String getSystemBrokerURL(){
		return Optional
				.ofNullable(System.getenv("BROKER_URL"))
				.orElseGet(() -> {
					// try default elasticsearch
					LOG.info("adding default server 'elasticsearch'");
					return "http://localhost:10010";
				});
	}

	public void registerSelfAtBroker() throws IOException{
		String url = getBrokerURL(null); 
		registerSelfAt(url + "/registerService");
	}

	public void registerSelfAt(String url) throws IOException {

		// prepare connection
		URL brokerURL = new URL(url);
		HttpURLConnection con = (HttpURLConnection)  brokerURL.openConnection();
		con.setRequestMethod("POST");
		con.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
		con.setDoOutput(true);

		// set the body
		OutputStream os = con.getOutputStream();
		
		String json = om.writeValueAsString(wikiservice);
		os.write(json.getBytes("UTF-8"));
		os.close();

		// get the result
		int status = con.getResponseCode();
		if (status == HttpURLConnection.HTTP_MOVED_TEMP || status == HttpURLConnection.HTTP_MOVED_PERM) {
			String newLocation = con.getHeaderField("Location");
			con.disconnect();
			registerSelfAt(newLocation);
			return;
		}

		con.disconnect();
	}


}
