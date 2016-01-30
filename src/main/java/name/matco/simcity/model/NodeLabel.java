package name.matco.simcity.model;

public enum NodeLabel {

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
