package name.matco.simcity.model;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Path;
import org.neo4j.graphdb.Relationship;
import org.neo4j.graphdb.Result;
import org.neo4j.graphdb.Transaction;

import name.matco.simcity.App;

public class NodeService {

	public static Object fromNode(final Node node, final NodeLabel label) throws NoSuchFieldException, SecurityException, InstantiationException, IllegalAccessException {
		return fromNode(node, label.getLabelClass());
	}

	public static Object fromNode(final Node node, final Class<?> nodeClass) throws NoSuchFieldException, SecurityException, InstantiationException, IllegalAccessException {
		final Object object = nodeClass.newInstance();
		for(final Entry<String, Object> entry : node.getAllProperties().entrySet()) {
			final Field field = nodeClass.getField(entry.getKey());
			field.set(object, entry.getValue());
		}
		return object;
	}

	public static List<Map<String, Object>> executeQuery(final String query) {
		final GraphDatabaseService database = App.getDatabase();
		final List<Map<String, Object>> results = new ArrayList<>();

		System.out.println(query);
		try (final Transaction transaction = database.beginTx(); final Result result = database.execute(query)) {
			while (result.hasNext()) {
				final Map<String, Object> row = result.next();
				final boolean managed = false;
				if (row.size() == 1) {
					final Object value = row.values().iterator().next();
					// if row result is only a node, flatten only node properties
					if(value instanceof Node) {
						results.add(((Node) value).getAllProperties());
					}
					// if row result is only a path, add nodes and relationship properties
					else if(value instanceof Path) {
						final Map<String, Object> path = new LinkedHashMap<>();
						final List<Map<String, Object>> nodeProperties = new ArrayList<>();
						path.put("nodes", nodeProperties);
						for(final Node node : ((Path) value).nodes()) {
							nodeProperties.add(node.getAllProperties());
						}
						final List<Map<String, Object>> relationshipProperties = new ArrayList<>();
						path.put("relationships", relationshipProperties);
						for(final Relationship relationship : ((Path) value).relationships()) {
							relationshipProperties.add(relationship.getAllProperties());
						}
						results.add(path);
					}
				}
				if(!managed) {
					results.add(row);
				}
				transaction.success();
			}
			return results;
		}
	}
}