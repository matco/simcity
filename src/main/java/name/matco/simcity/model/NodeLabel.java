package name.matco.simcity.model;

import org.neo4j.graphdb.Label;

public enum NodeLabel implements Label {

	BUILDING {
		@Override
		public String getId() {
			return "Building";
		}
	},
	INGREDIENT {
		@Override
		public String getId() {
			return "Ingredient";
		}
	};

	public abstract String getId();
}
