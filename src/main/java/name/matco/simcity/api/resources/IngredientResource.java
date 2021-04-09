package name.matco.simcity.api.resources;

import java.util.ArrayList;
import java.util.Optional;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.neo4j.graphdb.Direction;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Relationship;
import org.neo4j.graphdb.Transaction;
import org.neo4j.graphdb.traversal.TraversalDescription;
import org.neo4j.graphdb.traversal.Traverser;
import org.neo4j.graphdb.traversal.Uniqueness;

import name.matco.simcity.App;
import name.matco.simcity.model.Dependency;
import name.matco.simcity.model.Ingredient;
import name.matco.simcity.model.NodeCreationException;
import name.matco.simcity.model.NodeLabel;
import name.matco.simcity.model.NodeRelation;
import name.matco.simcity.model.NodeService;

@Path("ingredient")
public class IngredientResource extends NodeResource {

	@Override
	public NodeLabel getNodeType() {
		return NodeLabel.Ingredient;
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response allIngredients() throws NodeCreationException {
		return getAllNodes();
	}

	@GET
	@Path("/{id:[a-z_]+}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getIngredient(@PathParam("id") final String id) throws NodeCreationException {
		return getNode(id);
	}

	@GET
	@Path("/{id:[a-z_]+}/dependencies")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getIngredientDependencies(@PathParam("id") final String id) throws NodeCreationException {

		try(final Transaction tx = App.getDatabase().beginTx()) {
			//retrieve and create ingredient
			final Node node = App.getDatabase().findNode(NodeLabel.Ingredient, "id", id);
			if(node != null) {
				final Ingredient ingredient = (Ingredient) NodeService.fromNode(node, Ingredient.class);
				ingredient.dependencies = new ArrayList<>();

				//find dependencies
				final TraversalDescription td = App.getDatabase().traversalDescription()
					.relationships(NodeRelation.NEED, Direction.OUTGOING)
					.uniqueness(Uniqueness.NONE);
				final Traverser traverser = td.traverse(node);
				for(final org.neo4j.graphdb.Path path : traverser) {
					//every path starts from our ingredient
					Ingredient currentIngredient = ingredient;
					for(final Relationship relationship : path.relationships()) {
						final String endNodeId = (String) relationship.getEndNode().getProperty("id");
						//retrieve if dependency does not already exist
						final Optional<Dependency> existingDependency = currentIngredient.getDependency(endNodeId);
						if(!existingDependency.isPresent()) {
							final Dependency dependency = (Dependency) NodeService.fromNode(relationship.getEndNode(), Dependency.class);
							dependency.dependencies = new ArrayList<>();
							dependency.quantity = (Long) relationship.getProperty("quantity");
							currentIngredient.dependencies.add(dependency);
							currentIngredient = dependency;
						}
						else {
							currentIngredient = existingDependency.get();
						}
					}
				}
				return Response.ok(ingredient).build();
			}
			return Response.status(Response.Status.NOT_FOUND).build();
		}
	}

}
