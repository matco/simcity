'use strict';

var Ingredients = (function() {

	var SVG = {}
	SVG.Namespaces = {
		SVG : 'http://www.w3.org/2000/svg',
		XHTML : 'http://www.w3.org/1999/xhtml',
		XLINK : 'http://www.w3.org/1999/xlink'
	};

	var INGREDIENT_SIZE = window.matchMedia('(max-width: 800px)').matches ? 32 : 64;

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

		var group = document.createFullElementNS(SVG.Namespaces.SVG, 'g', {transform : 'translate(' + ingredient_x + ',' + ingredient_y + ')', 'data-quantity-factor' : quantity});
		svg.appendChild(group);
		//link
		var link = document.createFullElementNS(SVG.Namespaces.SVG, 'a', {title : ingredient.name});
		link.setAttributeNS(SVG.Namespaces.XLINK, 'xlink:href', '#ingredient=' + ingredient.id);
		group.appendChild(link);
		//image
		var image_properties = {
			x : 0,
			y : 0,
			height : INGREDIENT_SIZE,
			width : INGREDIENT_SIZE
		};
		var image = document.createFullElementNS(SVG.Namespaces.SVG, 'image', image_properties);
		image.setAttributeNS(SVG.Namespaces.XLINK, 'xlink:href', 'images/ingredients/' + ingredient.id + '.png');
		link.appendChild(image);
		//quantity
		var quantity_circle = document.createFullElementNS(SVG.Namespaces.SVG, 'circle', {cx : INGREDIENT_SIZE - 10, cy : INGREDIENT_SIZE - 10, r : 10, style : 'opacity: 0.8; fill: red;'});
		link.appendChild(quantity_circle);
		var quantity_text_size = get_quantity_text_size(quantity);
		var quantity_text_properties = {
			x : INGREDIENT_SIZE - 10,
			y : INGREDIENT_SIZE - 5,
			'text-anchor' : 'middle',
			style : 'font-size: ' + quantity_text_size + 'px; fill: white;'
		};
		var quantity_text = document.createFullElementNS(SVG.Namespaces.SVG, 'text', quantity_text_properties, quantity);
		link.appendChild(quantity_text);
		//draw dependencies
		var ingredient_width = get_ingredient_basic_dependencies_number(ingredient) * INGREDIENT_SIZE;
		var dependency_offset = x - ingredient_width / 2;

		ingredient.dependencies.forEach(function(dependency) {
			var dependency_dependencies_number = get_ingredient_basic_dependencies_number(dependency);
			var dependency_width = (dependency_dependencies_number || 1) * INGREDIENT_SIZE;
			var dependency_x = dependency_offset + dependency_width / 2;
			dependency_offset += dependency_width;

			var dependency_y = get_ingredient_level(dependency) * (INGREDIENT_SIZE + 30);

			var dependency_path = 'M ' + x + ' ' + ingredient_y + ' v -15 H ' + dependency_x + ' V ' + (dependency_y + INGREDIENT_SIZE);
			svg.appendChild(document.createFullElementNS(SVG.Namespaces.SVG, 'path', {d : dependency_path, style : 'fill: none; stroke: black; stroke-width: 4;'}));

			draw_ingredient(svg, dependency_x, dependency_y, dependency, quantity * dependency.quantity);
		});
	}

	function get_quantity_text_size(quantity) {
		return 11 / (quantity + '').length + 3;
	}

	return {
		Init : function() {
			var ingredient_dependencies = document.getElementById('ingredient_dependencies');
			function ingredient_quantity_listener(event) {
				Event.stop(event);
				//retrieve current quantity
				var current_quantity = parseInt(ingredient_dependencies.querySelector('text').textContent);
				var operand = parseInt(this.dataset.quantityOperand);
				var new_quantity = current_quantity + operand;
				if(new_quantity > 0) {
					ingredient_dependencies.querySelectorAll('g').forEach(function(dependency) {
						var dependency_factor = parseInt(dependency.getAttribute('data-quantity-factor'));
						var quantity_text = dependency.querySelector('text');
						var quantity = new_quantity * dependency_factor;
						quantity_text.style.fontSize = get_quantity_text_size(quantity) + 'px';
						quantity_text.textContent = quantity;
					});
				}
				else {
					console.log('Unable to set a negative quantity');
				}
			}
			document.getElementById('ingredient').querySelectorAll('[data-quantity-operand]').forEach(function(link) {
				link.addEventListener('click', ingredient_quantity_listener);
			});
		},
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
						ingredient_basic.style.display = 'none';
						var ingredient_dependencies = document.getElementById('ingredient_dependencies');
						ingredient_dependencies.clear();
						ingredient_dependencies.style.display = 'none';
						var ingredient_operations = document.querySelectorAll('#ingredient [data-quantity-operand]');
						ingredient_operations.forEach(function(link) {
							link.style.visibility = 'hidden';
						});

						if(!ingredient.dependencies || ingredient.dependencies.isEmpty()) {
							ingredient_basic.style.display = 'block';
						}
						else {
							//find selected ingredient level
							var ingredient_level = get_ingredient_level(ingredient);
							var ingredient_dependencies_number = get_ingredient_basic_dependencies_number(ingredient);

							//calculate required svg viewbox
							var x_max = ingredient_dependencies_number * INGREDIENT_SIZE;
							var y_max = ingredient_level * (INGREDIENT_SIZE + 30);
							ingredient_dependencies.style.width = x_max + 'px';
							ingredient_dependencies.style.height = (y_max + INGREDIENT_SIZE) + 'px';
							ingredient_dependencies.style.display = 'block';

							draw_ingredient(ingredient_dependencies, x_max / 2, y_max, ingredient, 1);

							ingredient_operations.forEach(function(link) {
								link.style.visibility = 'visible';
							});
						}

						//display ingredient panel
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