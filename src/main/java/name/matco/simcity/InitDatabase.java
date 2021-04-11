package name.matco.simcity;

import java.io.BufferedReader;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.QueryExecutionException;
import org.neo4j.graphdb.Transaction;

public class InitDatabase {

	private static final Logger LOGGER = LogManager.getLogger(InitDatabase.class.getName());

	private static void importStream(final GraphDatabaseService database, final String resourceName, final boolean stopOnError) throws QueryExecutionException, IOException, URISyntaxException {
		Path path = Paths.get(InitDatabase.class.getResource(resourceName).toURI());
		BufferedReader reader = Files.newBufferedReader(path);
		
		final StringBuilder query = new StringBuilder();
		String line = null;
		while((line = reader.readLine()) != null) {
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
				try(final Transaction tx = database.beginTx()) {
					tx.execute(query.toString());
					tx.commit();
				} catch (final Exception e) {
					LOGGER.error("Error with query [{}]: {}", query, e.getMessage());
					if(stopOnError) {
						throw e;
					}
				}
				query.delete(0, query.length());
			}
		}
	}

	public static void main(String[] args) throws QueryExecutionException, IOException, URISyntaxException {
		LOGGER.info("Starting initialization of database");
		final GraphDatabaseService database = App.getDatabase();
		importStream(database, "/neo4j/reset.txt", false);
		importStream(database, "/neo4j/data.txt", true);
		App.shutdownDatabase();
		LOGGER.info("Database initialized successfully");
	}
}
