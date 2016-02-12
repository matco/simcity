package name.matco.simcity.api;

import javax.ws.rs.ext.ContextResolver;
import javax.ws.rs.ext.Provider;

import com.fasterxml.jackson.databind.ObjectMapper;

@Provider
public class ObjectMapperResolver implements ContextResolver<ObjectMapper> {

	private final ObjectMapper mapper;

	public ObjectMapperResolver() {
		mapper = new ObjectMapper();
	}

	@Override
	public ObjectMapper getContext(final Class<?> type) {
		return mapper;
	}
}
