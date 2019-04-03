package name.matco.simcity.model;

import java.util.List;
import java.util.Optional;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(value = Include.NON_NULL)
public class Ingredient {

	public String id;
	public String name;
	public Long time;

	public List<Dependency> dependencies;

	public Optional<Dependency> getDependency(final String dependencyId) {
		return dependencies.stream().filter((final Dependency d) -> d.id.equals(dependencyId)).findFirst();
	}
}
