package name.matco.simcity;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.QueryExecutionException;
import org.neo4j.graphdb.Transaction;

import junit.framework.TestCase;

public class InitDatabase extends TestCase {

	private static final Logger LOGGER = LogManager.getLogger(InitDatabase.class.getName());

	private void importStream(final GraphDatabaseService database, final InputStream stream, final boolean stopOnError) throws QueryExecutionException, IOException {

		try(final BufferedReader input = new BufferedReader(new InputStreamReader(stream, Charset.forName("utf-8")))) {

			final StringBuilder query = new StringBuilder();
			String line = null;
			while ((line = input.readLine()) != null) {
				//empty lines
				if(line.trim().isEmpty()) {
					continue;
				}
				//inline comment
				if(line.startsWith("//")) {
					continue;
				}
				query.append(line);
				if(line.endsWith(";")) {
					try(final Transaction transaction = database.beginTx()) {
						database.execute(query.toString());
						transaction.success();
					} catch (final Exception e) {
						LOGGER.error(String.format("Error with query [{}]: {}", query, e.getMessage()));
						if(stopOnError) {
							throw e;
						}
					}
					query.delete(0, query.length());
				}
			}
		}
	}

	public void testInitDatabase() throws QueryExecutionException, IOException {
		final GraphDatabaseService database = App.getDatabase();
		importStream(database, getClass().getResourceAsStream("/neo4j/reset.txt"), false);
		importStream(database, getClass().getResourceAsStream("/neo4j/data.txt"), true);
	}
}
