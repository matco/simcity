package name.matco.simcity.api;

import java.io.IOException;

import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.ContextResolver;
import javax.ws.rs.ext.Provider;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.util.DefaultIndenter;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.jaxrs.cfg.EndpointConfigBase;
import com.fasterxml.jackson.jaxrs.cfg.ObjectWriterInjector;
import com.fasterxml.jackson.jaxrs.cfg.ObjectWriterModifier;

@Provider
public class ObjectMapperResolver implements ContextResolver<ObjectMapper> {

	private final ObjectMapper mapper;

	public ObjectMapperResolver() {
		mapper = new ObjectMapper();
		ObjectWriterInjector.set(new ObjectWriterModifier() {
			@Override
			public ObjectWriter modify(final EndpointConfigBase<?> endpoint, final MultivaluedMap<String, Object> responseHeaders, final Object valueToWrite, final ObjectWriter w, final JsonGenerator g) throws IOException {
				final DefaultPrettyPrinter pp = new DefaultPrettyPrinter();
				pp.indentObjectsWith(new DefaultIndenter("\t", "\n"));
				g.setPrettyPrinter(pp);
				return w;
			}
		});
	}

	@Override
	public ObjectMapper getContext(final Class<?> type) {
		return mapper;
	}
}
