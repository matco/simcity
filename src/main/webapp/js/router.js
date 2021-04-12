const Router = (function() {

	return {
		SelectIngredient: function(ingredient) {
			console.log(`Select ingredient ${ingredient.name}`);
			Ingredients.Open(ingredient);

			//generate state
			const state = {ingredient: ingredient.id};
			const hash = Hash.Encode(state);
			//push state if necessary
			if(location.hash !== hash) {
				history.pushState(state, `Simcity - ${ingredient.name}`, hash);
			}
		}
	};
})();

window.addEventListener(
	'hashchange',
	function() {
		//retrieve data encoded in hash
		const data = Hash.Decode(location.hash);
		//node
		if(data.hasOwnProperty('ingredient')) {
			//retrieve ingredient
			const ingredient = ingredients.find(Array.objectFilter({id: data.ingredient}));
			Router.SelectIngredient(ingredient);
		}
	}
);
