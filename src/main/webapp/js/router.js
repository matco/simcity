'use strict';

var Router = (function() {

	return {
		SelectIngredient : function(ingredient) {
			console.log('Select ingredient ' + ingredient.name);
			Ingredients.Open(ingredient);

			//generate state
			var state = {ingredient : ingredient.id};
			var hash = Hash.Encode(state);
			//push state if necessary
			if(location.hash !== hash) {
				history.pushState(state, 'Simcity - ' + ingredient.name, hash);
			}
		}
	};
})();

window.addEventListener(
	'hashchange',
	function() {
		//retrieve data encoded in hash
		var data = Hash.Decode(location.hash);
		//node
		if(data.hasOwnProperty('ingredient')) {
			//retrieve ingredient
			var ingredient = ingredients.find(Array.objectFilter({id : data.ingredient}));
			Router.SelectIngredient(ingredient);
		}
	}
);