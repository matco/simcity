package name.matco.simcity.api.resources;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import jakarta.ws.rs.core.Response;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.ResourceIterator;
import org.neo4j.graphdb.Transaction;

import name.matco.simcity.App;
import name.matco.simcity.model.NodeCreationException;
import name.matco.simcity.model.NodeLabel;
import name.matco.simcity.model.NodeService;

public abstract class NodeResource {

	private static final Logger LOGGER = LogManager.getLogger(NodeResource.class.getName());

	public abstract NodeLabel getNodeType();

	/* disabled until Jackson moves to jakarta package
	@QueryParam("pretty")
	public void setPretty(final boolean pretty) {
		if(pretty) {
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
	}*/

	public Response getAllNodes() throws NodeCreationException {
		LOGGER.info("Retrieving all {}", getNodeType().getId());
		final List<Object> nodes = new ArrayList<>();
		try(
			final Transaction tx = App.getDatabase().beginTx();
			final ResourceIterator<Node> result = App.getDatabase().findNodes(getNodeType())) {
			while(result.hasNext()) {
				nodes.add(NodeService.fromNode(result.next(), getNodeType()));
			}
		}

		return Response.ok(nodes).build();
	}

	public Response getNode(final String id) throws NodeCreationException {
		LOGGER.info("Retrieving {} {}", getNodeType().getId(), id);

		Object object = null;
		try(
			final Transaction tx = App.getDatabase().beginTx()) {
			final Node node = App.getDatabase().findNode(getNodeType(), "id", id);
			if(node != null) {
				object = NodeService.fromNode(node, getNodeType());
			}
		}
		if(object != null) {
			return Response.ok(object).build();
		}
		return Response.status(Response.Status.NOT_FOUND).build();
	}

	public Response executeQuery(final String query) {
		final List<Map<String, Object>> results = NodeService.executeQuery(query);
		return Response.ok(results).build();
	}
}
