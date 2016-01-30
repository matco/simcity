package name.matco.simcity;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.util.Properties;

import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.grizzly.http.server.NetworkListener;
import org.glassfish.grizzly.http.server.StaticHttpHandler;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.factory.GraphDatabaseFactory;

public class App {

	private static String API_URI = "http://0.0.0.0:8080/api/";

	private static Properties PROPERTIES;
	private static GraphDatabaseService DATABASE;

	private static HttpServer startServer() {
		final URI uri = URI.create(API_URI);
		System.out.println(String.format("Create server with URI %s", uri));

		//rest api
		final ResourceConfig rc = new ResourceConfig().packages("name.matco.simcity.api");
		rc.register(JacksonFeature.class);
		final HttpServer server = GrizzlyHttpServerFactory.createHttpServer(uri, rc);

		//static html
		final StaticHttpHandler httpHandler = new StaticHttpHandler("src/main/resources/website");
		server.getServerConfiguration().addHttpHandler(httpHandler, "/");

		for(final NetworkListener nl : server.getListeners()) {
			nl.getFileCache().setEnabled(false);
		}

		return server;
	}

	public static GraphDatabaseService getDatabase() {
		if(DATABASE == null) {
			System.out.println(String.format("Open database with path %s", getProperties().getProperty("db.path")));
			DATABASE = new GraphDatabaseFactory().newEmbeddedDatabase(new File(getProperties().getProperty("db.path")));
			Runtime.getRuntime().addShutdownHook(new Thread() {
				@Override
				public void run() {
					DATABASE.shutdown();
				}
			});
		}
		return DATABASE;
	}

	public static Properties getProperties() {
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

	public static void main(final String[] args) {
		startServer();
		//preload database
		getDatabase();
	}
}
