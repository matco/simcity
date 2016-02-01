'use strict';

var Ingredients = (function() {

	function draw_ingredient(ingredient) {
		var ingredient_li = document.createFullElement('li');
		var ingredient_link = document.createFullElement('a', {href : '#ingredient=' + ingredient.id, title : ingredient.name});
		ingredient_li.appendChild(ingredient_link);
		ingredient_link.appendChild(document.createFullElement('img', {src : 'images/ingredients/' + ingredient.id + '.png'}));
		ingredient_link.appendChild(document.createFullElement('span', {}, ingredient.quantity));
		return ingredient_li;
	}

	return {
		Open : function(ingredient) {
			var xhr = new XMLHttpRequest();
			xhr.addEventListener(
				'load',
				function(event) {
					if(event.target.status === 200) {
						var dependencies = event.target.response;

						//update title
						var ingredient_title = document.getElementById('ingredient_title');
						ingredient_title.clear();
						ingredient_title.appendChild(document.createFullElement('img', {src : 'images/ingredients/' + ingredient.id + '.png'}));
						ingredient_title.appendChild(document.createTextNode(ingredient.name));

						if(dependencies.isEmpty()) {
							document.getElementById('ingredient_basic').style.display = 'block';
							document.getElementById('ingredient_dependencies').style.display = 'none';
						}
						else {
							//find max depth
							var max_depth = dependencies.reduce(function(value, ingredient) {
								return Math.max(ingredient.depth, value);
							}, 0);
							var dependencies_div = document.getElementById('ingredient_dependencies');
							dependencies_div.clear();
							for(var i = max_depth; i > 0; i--) {
								var depth_dependencies = dependencies.filter(Array.objectFilter({depth : i}));
								var depth_dependencies_ul = document.createFullElement('ul');
								depth_dependencies.map(draw_ingredient).forEach(Node.prototype.appendChild, depth_dependencies_ul);
								dependencies_div.appendChild(depth_dependencies_ul);
								//draw arrow
								if(i > 1) {
									dependencies_div.appendChild(document.createFullElement('img', {src : 'images/arrow.svg'}));
								}
							}
							document.getElementById('ingredient_basic').style.display = 'none';
							document.getElementById('ingredient_dependencies').style.display = 'block';
						}
						document.getElementById('ingredient').style.display = 'block';
					}
					else {
						alert('Unable to retrieve ingredient');
					}
				}
			);
			xhr.open('GET', 'api/ingredient/' + ingredient.id + '/dependencies', true);
			xhr.send();
			xhr.responseType = 'json';
		},
		Close : function() {
			document.getElementById('ingredient').style.display = 'none';
		}
	};
})();