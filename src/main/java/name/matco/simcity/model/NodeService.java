package name.matco.simcity.model;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Result;
import org.neo4j.graphdb.Transaction;
import org.neo4j.kernel.impl.core.NodeProxy;

import name.matco.simcity.App;

public class NodeService {

	public static Object fromNode(final Node node, final NodeLabel label) throws NoSuchFieldException, SecurityException, InstantiationException, IllegalAccessException {
		final Object object = label.getLabelClass().newInstance();
		for(final Entry<String, Object> entry : node.getAllProperties().entrySet()) {
			final Field field = label.getLabelClass().getDeclaredField(entry.getKey());
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
				if (row.size() == 1 && row.values().iterator().next() instanceof NodeProxy) {
					final NodeProxy value = (NodeProxy) row.values().iterator().next();
					// if row result is only an entire node, flatten only node properties
					results.add(value.getAllProperties());
				} else {
					results.add(row);
				}
			}
			transaction.success();
		}
		return results;
	}
}
