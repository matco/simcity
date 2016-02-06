package name.matco.simcity.api;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import name.matco.simcity.model.NodeLabel;

@Path("ingredient")
public class IngredientResource extends NodeResource {

	@Override
	public NodeLabel getNodeType() {
		return NodeLabel.Ingredient;
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response allIngredients() throws NoSuchFieldException, SecurityException, InstantiationException, IllegalAccessException {
		return getAllNodes();
	}

	@GET
	@Path("/{id:[a-z_]+}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getIngredient(@PathParam("id") final String id) throws NoSuchFieldException, SecurityException, InstantiationException, IllegalAccessException {
		return getNode(id);
	}

	@GET
	@Path("/{id:[a-z_]+}/dependencies")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getIngredientDependencies(@PathParam("id") final String id) {
		System.out.println(String.format("Retrieving dependencies for ingredient %s", id));
		final String query = String.format("MATCH (:Ingredient {id : \"%s\"})-[r:NEED*]->(i:Ingredient)<-[:BUILD]-(b:Building) " +
				"RETURN b.name as building, i.id as id, i.name as name, LENGTH(r) as depth, REDUCE(quantities = 1, x IN r | quantities * x.quantity) as quantity", id);
		return executeQuery(query);
	}

}
