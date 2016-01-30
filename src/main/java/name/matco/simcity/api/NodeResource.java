package name.matco.simcity.api;

import java.util.List;
import java.util.Map;

import javax.ws.rs.core.Response;

import name.matco.simcity.model.NodeLabel;
import name.matco.simcity.model.NodeService;

public abstract class NodeResource {

	public abstract NodeLabel getNodeType();

	public Response getAllNodes() {
		System.out.println(String.format("Retrieving all %s", getNodeType().getId()));
		final String query = String.format("MATCH (i:%s) RETURN i.id as id, i.name as name", getNodeType().getId());
		final List<Map<String, Object>> results = NodeService.executeQuery(query);
		return Response.ok(results).build();
	}

	public Response getNode(final String id) {
		System.out.println(String.format("Retrieving %s %s", getNodeType().getId(), id));
		final String query = String.format("MATCH (i:%s {id : \"%s\"}) RETURN i", getNodeType().getId(), id);
		final List<Map<String, Object>> results = NodeService.executeQuery(query);
		if(results.isEmpty()) {
			return Response.status(Response.Status.NOT_FOUND).build();
		}
		return Response.ok(results.get(0)).build();
	}

	public Response executeQuery(final String query) {
		final List<Map<String, Object>> results = NodeService.executeQuery(query);
		return Response.ok(results).build();
	}
}
