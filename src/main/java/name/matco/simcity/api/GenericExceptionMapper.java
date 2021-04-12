package name.matco.simcity.api;

import java.util.Collections;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

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
