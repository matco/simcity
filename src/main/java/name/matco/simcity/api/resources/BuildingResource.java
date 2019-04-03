package name.matco.simcity.api.resources;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import name.matco.simcity.model.NodeCreationException;
import name.matco.simcity.model.NodeLabel;

@Path("building")
public class BuildingResource extends NodeResource {

	@Override
	public NodeLabel getNodeType() {
		return NodeLabel.Building;
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response allBuildings() throws NodeCreationException {
		return getAllNodes();
	}

	@GET
	@Path("/{id:[a-z_]+}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getBuilding(@PathParam("id") final String id) throws NodeCreationException {
		return getNode(id);
	}

	@GET
	@Path("/{id:[a-z_]+}/ingredients")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getIngredient(@PathParam("id") final String id) {
		System.out.println(String.format("Retrieving building ingredients for building %s" + id));
		final String query = String.format("MATCH (b:Building {id : %s})-[:BUILD]->(i:Ingredient) RETURN i.id as id, i.name as name", id);
		return executeQuery(query);
	}

}
