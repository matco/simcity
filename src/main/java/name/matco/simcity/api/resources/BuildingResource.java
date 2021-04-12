package name.matco.simcity.api.resources;

import java.util.Collection;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import name.matco.simcity.model.Building;
import name.matco.simcity.model.NodeCreationException;
import name.matco.simcity.model.NodeLabel;

@Path("building")
public class BuildingResource extends NodeResource<Building> {

	private static final Logger LOGGER = LogManager.getLogger(BuildingResource.class.getName());

	@Override
	public NodeLabel getNodeType() {
		return NodeLabel.Building;
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Collection<Building> allBuildings() throws NodeCreationException {
		return getAllNodes();
	}

	@GET
	@Path("/{id:[a-z_]+}")
	@Produces(MediaType.APPLICATION_JSON)
	public Building getBuilding(@PathParam("id") final String id) throws NodeCreationException {
		return getNode(id);
	}

	@GET
	@Path("/{id:[a-z_]+}/ingredients")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getIngredient(@PathParam("id") final String id) {
		LOGGER.info("Retrieving building ingredients for building {}", id);
		final String query = String.format("MATCH (b:Building {id : \"%s\"})-[:BUILD]->(i:Ingredient) RETURN i.id as id, i.name as name", id);
		return executeQuery(query);
	}

}
