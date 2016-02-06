package name.matco.simcity.api;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.ws.rs.core.Response;

import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.ResourceIterator;
import org.neo4j.graphdb.Transaction;

import name.matco.simcity.App;
import name.matco.simcity.model.NodeLabel;
import name.matco.simcity.model.NodeService;

public abstract class NodeResource {

	public abstract NodeLabel getNodeType();

	public Response getAllNodes() throws NoSuchFieldException, SecurityException, InstantiationException, IllegalAccessException {
		System.out.println(String.format("Retrieving all %s", getNodeType().getId()));
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

	public Response getNode(final String id) throws NoSuchFieldException, SecurityException, InstantiationException, IllegalAccessException {
		System.out.println(String.format("Retrieving %s %s", getNodeType().getId(), id));

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
