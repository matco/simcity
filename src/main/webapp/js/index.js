'use strict';

var ingredients;

function get_ingredients(callback) {
	var xhr = new XMLHttpRequest();
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
	xhr.open('GET', '/api/ingredient', true);
	xhr.send();
	xhr.responseType = 'json';
}

function manage_ingredient_autocomplete() {
	var input = document.getElementById('recipe')['ingredient'];
	var results = document.getElementById('ingredients');

	//close results on a click outside
	document.addEventListener('click', function(event) {
		if(!results.contains(event.target) && !input.contains(event.target)) {
			results.style.display = 'none';
		}
	});

	var result_ingredients;
	var result_ingredient;

	function unselect_all() {
		result_ingredient = undefined;
		results.querySelectorAll('li').forEach(function(item) {
			item.classList.remove('selected');
		});
	}

	function manage_mouse_over() {
		unselect_all();
		result_ingredient = this.ingredient;
		this.classList.add('selected');
	}

	function manage_mouse_out() {
		unselect_all();
		this.classList.remove('selected');
	}

	function manage_mouse_click() {
		results.style.display = 'none';
		input.value = '';
		Router.SelectIngredient.call(undefined, this.ingredient);
	}

	function manage_keys(event) {
		//enter
		if(event.keyCode === 13) {
			if(result_ingredient) {
				input.value = '';
				results.style.display = 'none';
				Router.SelectIngredient.call(undefined, result_ingredient);
			}
		}
		//escape
		if(event.keyCode === 27) {
			result_ingredient = undefined;
			results.style.display = 'none';
		}
		//down or up
		if(event.keyCode === 40 || event.keyCode === 38) {
			//going down
			if(event.keyCode === 40) {
				//initialize selection on the top ingredient
				if(!result_ingredient || result_ingredient === result_ingredients.last()) {
					result_ingredient = result_ingredients[0];
				}
				//normal case, select the next ingredient
				else {
					result_ingredient = result_ingredients[result_ingredients.indexOf(result_ingredient) + 1];
				}
			}
			//going up
			else {
				//initialize selection on bottom ingredient
				if(!result_ingredient || result_ingredient === result_ingredients.first()) {
					result_ingredient = result_ingredients.last();
				}
				//normal case, select the previous ingredient
				else {
					result_ingredient = result_ingredients[result_ingredients.indexOf(result_ingredient) - 1];
				}
			}
			//update results list
			results.querySelectorAll('li').forEach(function(item) {
				if(item.ingredient === result_ingredient) {
					item.classList.add('selected');
				}
				else {
					item.classList.remove('selected');
				}
			});
		}
	}

	function search_change(event) {
		Ingredients.Close();
		//reset results as input content has changed
		results.clear();
		//reset selection
		result_ingredient = undefined;
		//stop listening keyboard
		document.removeEventListener('keyup', manage_keys);

		var value = this.value;
		if(value) {
			//search ingredients and take only first 10 results
			result_ingredients = ingredients.filter(function(ingredient) {
				return ingredient.name.nocaseIncludes(value);
			});
			result_ingredients = result_ingredients.slice(0, 10);

			//prepare regexp to highlight part of ingredient matching the search
			var regexp = new RegExp('('+ value + ')', 'gi');
			result_ingredients.forEach(function(ingredient) {
				var ingredient_li = document.createElement('li');
				ingredient_li.appendChild(document.createFullElement('img', {src : '../images/ingredients/' + ingredient.id + '.png'}));
				ingredient_li.ingredient = ingredient;

				//label
				var ingredient_label = document.createElement('span');
				ingredient_label.innerHTML = ingredient.name.replace(regexp, '<span class="highlight">$1</span>');
				ingredient_li.appendChild(ingredient_label);

				//listeners
				ingredient_li.addEventListener('mouseout', manage_mouse_out);
				ingredient_li.addEventListener('mouseover', manage_mouse_over);
				ingredient_li.addEventListener('click', manage_mouse_click);

				results.appendChild(ingredient_li);
			});
			if(result_ingredients.length > 0) {
				results.style.display = 'block';
				//listen keyboard in order to let user navigate trough results
				document.addEventListener('keyup', manage_keys);
			}
		}
		else {
			results.style.display = 'none';
		}
	}

	//add listeners to show search results as user type
	input.addEventListener('input', search_change);
}

window.addEventListener(
	'load',
	function() {
		get_ingredients(function() {
			manage_ingredient_autocomplete();

			document.getElementById('recipe').addEventListener(
				'submit',
				function(event) {
					Event.stop(event);
					var ingredient = ingredients.find(Array.objectFilter({'name' : this.value}));
					if(ingredient) {
						Router.SelectIngredient(ingredient);
					}
				}
			);

			//try to restore selected node
			var event = new UIEvent('hashchange', {bubbles : true, cancelable : true, detail : 1});
			window.dispatchEvent(event);
		});
	}
);