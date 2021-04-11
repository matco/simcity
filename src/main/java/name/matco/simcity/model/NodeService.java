package name.matco.simcity.model;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Result;
import org.neo4j.graphdb.Transaction;
import org.neo4j.kernel.impl.core.NodeEntity;

import name.matco.simcity.App;

public class NodeService {

	private static final Logger LOGGER = LogManager.getLogger(NodeService.class.getName());

	public static Object fromNode(final Node node, final NodeLabel label) throws NodeCreationException {
		return fromNode(node, label.getLabelClass());
	}

	public static Object fromNode(final Node node, final Class<?> nodeClass) throws NodeCreationException {
		try {
			final Object object = nodeClass.getDeclaredConstructor().newInstance();
			for(final Entry<String, Object> entry : node.getAllProperties().entrySet()) {
				final Field field = nodeClass.getField(entry.getKey());
				field.set(object, entry.getValue());
			}
			return object;
		}
		catch(final Exception e) {
			throw new NodeCreationException(nodeClass);
		}
	}

	public static List<Map<String, Object>> executeQuery(final String query) {
		final GraphDatabaseService database = App.getDatabase();
		final List<Map<String, Object>> results = new ArrayList<>();

		LOGGER.info(query);
		try(final Transaction tx = database.beginTx();
			final Result result = tx.execute(query);
		) {
			while (result.hasNext()) {
				final Map<String, Object> row = result.next();
				if (row.size() == 1 && row.values().iterator().next() instanceof NodeEntity) {
					final NodeEntity value = (NodeEntity) row.values().iterator().next();
					// if row result is only an entire node, flatten only node properties
					results.add(value.getAllProperties());
				} else {
					results.add(row);
				}
			}
		}
		return results;
	}
}
