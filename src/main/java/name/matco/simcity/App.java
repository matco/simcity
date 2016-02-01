package name.matco.simcity;

import java.io.File;
import java.io.IOException;
import java.util.Properties;

import javax.ws.rs.ApplicationPath;

import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.factory.GraphDatabaseFactory;

@ApplicationPath("api")
public class App extends ResourceConfig {

	private static Properties PROPERTIES;
	private static GraphDatabaseService DATABASE;

	public App() {
		packages("name.matco.simcity.api");
		register(JacksonFeature.class);
	}

	public static GraphDatabaseService getDatabase() {
		if(DATABASE == null) {
			System.out.println(String.format("Open database with path %s", getAppProperties().getProperty("db.path")));
			DATABASE = new GraphDatabaseFactory().newEmbeddedDatabase(new File(getAppProperties().getProperty("db.path")));
			Runtime.getRuntime().addShutdownHook(new Thread() {
				@Override
				public void run() {
					DATABASE.shutdown();
				}
			});
		}
		return DATABASE;
	}

	public static Properties getAppProperties() {
		if(PROPERTIES == null) {
			PROPERTIES = new Properties();
			try {
				PROPERTIES.load(App.class.getResourceAsStream("/config.properties"));
			} catch (final IOException e) {
				e.printStackTrace();
			}
		}
		return PROPERTIES;
	}
}
