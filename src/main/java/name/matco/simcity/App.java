package name.matco.simcity;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import jakarta.ws.rs.ApplicationPath;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.factory.GraphDatabaseFactory;

@ApplicationPath("api")
public class App extends ResourceConfig {

	private static final Logger LOGGER = LogManager.getLogger(App.class.getName());

	private static Properties PROPERTIES;
	private static GraphDatabaseService DATABASE;

	public App() {
		packages("name.matco.simcity.api");
		register(JacksonFeature.class);
		Runtime.getRuntime().addShutdownHook(new Thread() {
			@Override
			public void run() {
				shutdownDatabase();
			}
		});
	}

	public static GraphDatabaseService getDatabase() {
		if(DATABASE == null) {
			final String path = getAppProperties().getProperty("db.path");
			LOGGER.info("Open database with path {}", path);
			DATABASE = new GraphDatabaseFactory().newEmbeddedDatabase(new File(path));
		}
		return DATABASE;
	}
	
	public static void shutdownDatabase() {
		DATABASE.shutdown();
	}

	public static Properties getAppProperties() {
		if(PROPERTIES == null) {
			PROPERTIES = new Properties();
			try(InputStream stream = App.class.getResourceAsStream("/config.properties")) {
				PROPERTIES.load(stream);
			} catch (final IOException e) {
				e.printStackTrace();
			}
		}
		return PROPERTIES;
	}
}
