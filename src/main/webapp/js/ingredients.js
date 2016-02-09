'use strict';

var Ingredients = (function() {

	const SVG = {}
	SVG.Namespaces = {
		SVG : 'http://www.w3.org/2000/svg',
		XHTML : 'http://www.w3.org/1999/xhtml',
		XLINK : 'http://www.w3.org/1999/xlink'
	};

	const INGREDIENT_SIZE = 20;

	function get_ingredient_level(ingredient) {
		if(!ingredient.dependencies) {
			return 0;
		}
		return ingredient.dependencies.reduce(function(value, dependency) {
			return Math.max(1 + get_ingredient_level(dependency), value);
		}, 0);
	}

	function get_ingredient_dependencies_number(ingredient) {
		if(!ingredient.dependencies) {
			return 0;
		}
		return ingredient.dependencies.reduce(function(value, dependency) {
			return value + get_ingredient_dependencies_number(dependency);
		}, ingredient.dependencies.length);
	}

	function get_ingredient_basic_dependencies_number(ingredient) {
		if(!ingredient.dependencies) {
			return 0;
		}
		return ingredient.dependencies.reduce(function(value, dependency) {
			var additional_value;
			if(!dependency.dependencies || dependency.dependencies.isEmpty()) {
				additional_value = 1;
			}
			else {
				additional_value = get_ingredient_basic_dependencies_number(dependency);
			}
			return value + additional_value;
		}, 0);
	}

	function draw_ingredient(svg, x, y, ingredient, quantity) {
		var ingredient_x = (x - INGREDIENT_SIZE / 2);
		var ingredient_y = y;

		var group = document.createFullElementNS(SVG.Namespaces.SVG, 'g', {transform : 'translate(' + ingredient_x + ',' + ingredient_y + ')'});
		svg.appendChild(group);
		//link
		var link = document.createFullElementNS(SVG.Namespaces.SVG, 'a', {title : ingredient.name});
		link.setAttributeNS(SVG.Namespaces.XLINK, 'xlink:href', '#ingredient=' + ingredient.id);
		group.appendChild(link);
		//image
		var image_properties = {
			x : 0,
			y : 0,
			height : INGREDIENT_SIZE + 'px',
			width : INGREDIENT_SIZE + 'px'
		};
		var image = document.createFullElementNS(SVG.Namespaces.SVG, 'image', image_properties);
		image.setAttributeNS(SVG.Namespaces.XLINK, 'xlink:href', 'images/ingredients/' + ingredient.id + '.png');
		link.appendChild(image);
		//quantity
		if(quantity) {
			var quantity_circle = document.createFullElementNS(SVG.Namespaces.SVG, 'circle', {cx : INGREDIENT_SIZE - 5, cy : INGREDIENT_SIZE - 5, r : 4, style : 'opacity: 0.9; fill: red;'});
			link.appendChild(quantity_circle);
			var quantity_text = document.createFullElementNS(SVG.Namespaces.SVG, 'text', {x : INGREDIENT_SIZE - 7, y : INGREDIENT_SIZE - 3, style : 'font-size: 6px; fill: white;'}, quantity);
			link.appendChild(quantity_text);
		}
		//draw dependencies
		var ingredient_width = get_ingredient_basic_dependencies_number(ingredient) * INGREDIENT_SIZE;
		var dependency_offset = x - ingredient_width / 2;

		ingredient.dependencies.forEach(function(dependency) {
			var dependency_dependencies_number = get_ingredient_basic_dependencies_number(dependency);
			var dependency_width = (dependency_dependencies_number || 1) * INGREDIENT_SIZE;
			var dependency_x = dependency_offset + dependency_width / 2;
			dependency_offset += dependency_width;

			var dependency_y = get_ingredient_level(dependency) * (INGREDIENT_SIZE + 10);

			var dependency_path = 'M ' + x + ' ' + ingredient_y + ' v -5 H ' + dependency_x + ' V ' + (dependency_y + INGREDIENT_SIZE);
			svg.appendChild(document.createFullElementNS(SVG.Namespaces.SVG, 'path', {d : dependency_path, style : 'fill: none; stroke: black; stroke-width: 1.5px;'}));

			draw_ingredient(svg, dependency_x, dependency_y, dependency, dependency.quantity);
		});
	}

	return {
		Open : function(ingredient) {
			var xhr = new XMLHttpRequest();
			xhr.addEventListener(
				'load',
				function(event) {
					if(event.target.status === 200) {
						var ingredient = event.target.response;

						//update title
						var ingredient_title = document.getElementById('ingredient_title');
						ingredient_title.clear();
						ingredient_title.appendChild(document.createFullElement('img', {src : 'images/ingredients/' + ingredient.id + '.png'}));
						ingredient_title.appendChild(document.createTextNode(ingredient.name));

						//reset ui
						var ingredient_basic = document.getElementById('ingredient_basic');
						var ingredient_dependencies = document.getElementById('ingredient_dependencies');
						ingredient_basic.style.display = 'none';
						ingredient_dependencies.clear();
						ingredient_dependencies.style.display = 'none';

						if(!ingredient.dependencies || ingredient.dependencies.isEmpty()) {
							ingredient_basic.style.display = 'block';
						}
						else {
							//find selected ingredient level
							var ingredient_level = get_ingredient_level(ingredient);
							var ingredient_dependencies_number = get_ingredient_dependencies_number(ingredient);

							//calculate required svg viewbox
							var x_max = ingredient_dependencies_number * INGREDIENT_SIZE;
							var y_max = ingredient_level * (INGREDIENT_SIZE + 10);
							ingredient_dependencies.setAttribute('viewBox', '0 0 ' + x_max + ' ' + (y_max + INGREDIENT_SIZE));
							ingredient_dependencies.style.display = 'block';

							draw_ingredient(ingredient_dependencies, x_max / 2, y_max, ingredient);
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