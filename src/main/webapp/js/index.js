import './tools/extension.js';
import './tools/dom_extension.js';

import {Ingredients} from './ingredients.js';
import {Forms} from './tools/forms.js';
import {Router} from './router.js';

function provide_ingredient(text) {
	return Ingredients.GetIngredients().filter(function(ingredient) {
		return ingredient.name.nocaseIncludes(text);
	}).slice(0, 10);
}

function draw_ingredient(ingredient, value) {
	//prepare regexp to highlight part of ingredient matching the search
	const regexp = new RegExp(`(${value})`, 'gi');
	const ingredient_li = document.createFullElement('li', {'data-value': ingredient.name});
	ingredient_li.appendChild(document.createFullElement('img', {src: `images/ingredients/${ingredient.id}.png`}));
	//label
	const ingredient_label = document.createElement('span');
	ingredient_label.innerHTML = ingredient.name.replace(regexp, '<span class="highlight">$1</span>');
	ingredient_li.appendChild(ingredient_label);
	return ingredient_li;
}

function select_ingredient(ingredient_name) {
	const ingredient = Ingredients.GetIngredients().find(i => i.name.toLowerCase() === ingredient_name.toLowerCase());
	if(ingredient) {
		Router.SelectIngredient(ingredient);
	}
}

window.addEventListener(
	'load',
	async function() {
		await Ingredients.Init();

		Forms.Autocomplete(
			document.getElementById('recipe')['ingredient'],
			document.getElementById('ingredients'),
			provide_ingredient,
			draw_ingredient,
			(_, ingredient_name) => select_ingredient(ingredient_name),
			undefined,
			Ingredients.Close
		);

		document.getElementById('recipe').addEventListener(
			'submit',
			function(event) {
				event.stop();
				select_ingredient(this['ingredient'].value);
			}
		);

		//try to restore selected node
		const event = new UIEvent('hashchange', {bubbles: true, cancelable: true, detail: 1});
		window.dispatchEvent(event);
	}
);
