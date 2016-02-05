package name.matco.simcity.api;

import java.util.Collections;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

@Provider
public class GenericExceptionMapper implements ExceptionMapper<Throwable> {

	@Override
	public Response toResponse(final Throwable exception) {
		exception.printStackTrace();
		return Response
				.serverError()
				.type(MediaType.APPLICATION_JSON)
				.entity(Collections.singletonMap("message", exception.getMessage()))
				.build();
	}

}