let ingredients;

(function() {

	function get_ingredients(callback) {
		const xhr = new XMLHttpRequest();
		xhr.addEventListener(
			'load',
			function(event) {
				if(event.target.status === 200) {
					ingredients = event.target.response;
					callback(ingredients);
				}
				else {
					alert('Unable to retrieve ingredients');
				}
			}
		);
		xhr.open('GET', 'api/ingredient', true);
		xhr.send();
		xhr.responseType = 'json';
	}

	function provide_ingredient(text) {
		return ingredients.filter(function(ingredient) {
			return ingredient.name.nocaseIncludes(text);
		}).slice(0, 10);
	}

	function draw_ingredient(ingredient, value) {
		//prepare regexp to highlight part of ingredient matching the search
		const regexp = new RegExp(`(${value})`, 'gi');
		const ingredient_li = document.createElement('li');
		ingredient_li.appendChild(document.createFullElement('img', {src: `images/ingredients/${ingredient.id}.png`}));
		//label
		const ingredient_label = document.createElement('span');
		ingredient_label.innerHTML = ingredient.name.replace(regexp, '<span class="highlight">$1</span>');
		ingredient_li.appendChild(ingredient_label);
		return ingredient_li;
	}

	window.addEventListener(
		'load',
		function() {
			Ingredients.Init();
			get_ingredients(function() {

				Forms.Autocomplete(
					document.getElementById('recipe')['ingredient'],
					document.getElementById('ingredients'),
					provide_ingredient,
					draw_ingredient,
					Router.SelectIngredient,
					undefined,
					Ingredients.Close
				);

				document.getElementById('recipe').addEventListener(
					'submit',
					function(event) {
						Event.stop(event);
						const ingredient = ingredients.find(Array.objectFilter({'name': this.value}));
						if(ingredient) {
							Router.SelectIngredient(ingredient);
						}
					}
				);

				//try to restore selected node
				const event = new UIEvent('hashchange', {bubbles: true, cancelable: true, detail: 1});
				window.dispatchEvent(event);
			});
		}
	);
})();
