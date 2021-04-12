package name.matco.simcity.model;

import org.neo4j.graphdb.Label;

public enum NodeLabel implements Label {

	Building {
		@Override
		public String getId() {
			return "Building";
		}

		@Override
		public Class<?> getLabelClass() {
			return name.matco.simcity.model.Building.class;
		}
	},
	Ingredient {
		@Override
		public String getId() {
			return "Ingredient";
		}

		@Override
		public Class<?> getLabelClass() {
			return name.matco.simcity.model.Ingredient.class;
		}
	};

	public abstract String getId();

	public abstract Class<?> getLabelClass();
}
