package name.matco.simcity.model;

public class NodeCreationException extends Exception {

	private static final long serialVersionUID = 8550774065245142877L;

	public NodeCreationException(final Class<?> nodeClass) {
		super("Unable to create node of class " + nodeClass.getCanonicalName());
	}
}
