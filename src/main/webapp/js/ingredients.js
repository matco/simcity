const SVG = {};
SVG.Namespaces = {
	SVG: 'http://www.w3.org/2000/svg',
	XHTML: 'http://www.w3.org/1999/xhtml',
	XLINK: 'http://www.w3.org/1999/xlink'
};

const INGREDIENT_SIZE = window.matchMedia('(max-width: 800px)').matches ? 32 : 64;

let ingredients = [];

function get_ingredient_level(ingredient) {
	if(!ingredient.dependencies) {
		return 0;
	}
	return ingredient.dependencies.reduce(function(value, dependency) {
		return Math.max(1 + get_ingredient_level(dependency), value);
	}, 0);
}

/*function get_ingredient_dependencies_number(ingredient) {
	if(!ingredient.dependencies) {
		return 0;
	}
	return ingredient.dependencies.reduce(function(value, dependency) {
		return value + get_ingredient_dependencies_number(dependency);
	}, ingredient.dependencies.length);
}*/

function get_ingredient_basic_dependencies_number(ingredient) {
	if(!ingredient.dependencies) {
		return 0;
	}
	return ingredient.dependencies.reduce(function(value, dependency) {
		let additional_value;
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
	const ingredient_x = (x - INGREDIENT_SIZE / 2);
	const ingredient_y = y;

	const group = document.createFullElementNS(SVG.Namespaces.SVG, 'g', {transform: `translate(${ingredient_x},${ingredient_y})`, 'data-quantity-factor': quantity});
	svg.appendChild(group);
	//link
	const link = document.createFullElementNS(SVG.Namespaces.SVG, 'a', {title: ingredient.name});
	link.setAttributeNS(SVG.Namespaces.XLINK, 'xlink:href', `#ingredient=${ingredient.id}`);
	group.appendChild(link);
	//image
	const image_properties = {
		x: 0,
		y: 0,
		height: INGREDIENT_SIZE,
		width: INGREDIENT_SIZE
	};
	const image = document.createFullElementNS(SVG.Namespaces.SVG, 'image', image_properties);
	image.setAttributeNS(SVG.Namespaces.XLINK, 'xlink:href', `images/ingredients/${ingredient.id}.png`);
	link.appendChild(image);
	//quantity
	const quantity_circle = document.createFullElementNS(SVG.Namespaces.SVG, 'circle', {cx: INGREDIENT_SIZE - 10, cy: INGREDIENT_SIZE - 10, r: 10, style: 'opacity: 0.8; fill: red;'});
	link.appendChild(quantity_circle);
	const quantity_text_size = get_quantity_text_size(quantity);
	const quantity_text_properties = {
		x: INGREDIENT_SIZE - 10,
		y: INGREDIENT_SIZE - 5,
		'text-anchor': 'middle',
		style: `font-size: ${quantity_text_size}px; fill: white;`
	};
	const quantity_text = document.createFullElementNS(SVG.Namespaces.SVG, 'text', quantity_text_properties, quantity);
	link.appendChild(quantity_text);
	//draw dependencies
	const ingredient_width = get_ingredient_basic_dependencies_number(ingredient) * INGREDIENT_SIZE;
	let dependency_offset = x - ingredient_width / 2;

	ingredient.dependencies.forEach(function(dependency) {
		const dependency_dependencies_number = get_ingredient_basic_dependencies_number(dependency);
		const dependency_width = (dependency_dependencies_number || 1) * INGREDIENT_SIZE;
		const dependency_x = dependency_offset + dependency_width / 2;
		dependency_offset += dependency_width;

		const dependency_y = get_ingredient_level(dependency) * (INGREDIENT_SIZE + 30);

		const dependency_path = `M ${x} ${ingredient_y} v -15 H ${dependency_x} V ${dependency_y + INGREDIENT_SIZE}`;
		svg.appendChild(document.createFullElementNS(SVG.Namespaces.SVG, 'path', {d: dependency_path, style: 'fill: none; stroke: black; stroke-width: 4;'}));

		draw_ingredient(svg, dependency_x, dependency_y, dependency, quantity * dependency.quantity);
	});
}

function get_quantity_text_size(quantity) {
	return 11 / (`${quantity}`).length + 3;
}

export const Ingredients = {
	Init: async function() {
		try {
			const response = await fetch('/api/ingredient');
			ingredients = await response.json();
		}
		catch(error) {
			console.error(error);
			alert('Unable to retrieve ingredients');
		}

		const ingredient_dependencies = document.getElementById('ingredient_dependencies');
		function ingredient_quantity_listener(event) {
			event.stop();
			//retrieve current quantity
			const current_quantity = parseInt(ingredient_dependencies.querySelector('text').textContent);
			const operand = parseInt(this.dataset.quantityOperand);
			const new_quantity = current_quantity + operand;
			if(new_quantity > 0) {
				ingredient_dependencies.querySelectorAll('g').forEach(function(dependency) {
					const dependency_factor = parseInt(dependency.getAttribute('data-quantity-factor'));
					const quantity_text = dependency.querySelector('text');
					const quantity = new_quantity * dependency_factor;
					quantity_text.style.fontSize = `${get_quantity_text_size(quantity)}px`;
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
	GetIngredients: function() {
		return ingredients;
	},
	Open: async function(ingredient_id) {
		try {
			const response = await fetch(`api/ingredient/${ingredient_id}/dependencies`);
			const ingredient = await response.json();

			//update title
			const ingredient_title = document.getElementById('ingredient_title');
			ingredient_title.empty();
			ingredient_title.appendChild(document.createFullElement('img', {src: `images/ingredients/${ingredient.id}.png`}));
			ingredient_title.appendChild(document.createTextNode(ingredient.name));

			//reset ui
			const ingredient_basic = document.getElementById('ingredient_basic');
			ingredient_basic.style.display = 'none';
			const ingredient_dependencies = document.getElementById('ingredient_dependencies');
			ingredient_dependencies.empty();
			ingredient_dependencies.style.display = 'none';
			const ingredient_operations = document.querySelectorAll('#ingredient [data-quantity-operand]');
			ingredient_operations.forEach(function(link) {
				link.style.visibility = 'hidden';
			});

			if(!ingredient.dependencies || ingredient.dependencies.isEmpty()) {
				ingredient_basic.style.display = 'block';
			}
			else {
				//find selected ingredient level
				const ingredient_level = get_ingredient_level(ingredient);
				const ingredient_dependencies_number = get_ingredient_basic_dependencies_number(ingredient);

				//calculate required svg viewbox
				const x_max = ingredient_dependencies_number * INGREDIENT_SIZE;
				const y_max = ingredient_level * (INGREDIENT_SIZE + 30);
				ingredient_dependencies.style.width = `${x_max}px`;
				ingredient_dependencies.style.height = `${y_max + INGREDIENT_SIZE}px`;
				ingredient_dependencies.style.display = 'block';

				draw_ingredient(ingredient_dependencies, x_max / 2, y_max, ingredient, 1);

				ingredient_operations.forEach(function(link) {
					link.style.visibility = 'visible';
				});
			}

			//display ingredient panel
			document.getElementById('ingredient').style.display = 'block';
		}
		catch(error) {
			console.error(error);
			alert('Unable to retrieve ingredient');
		}
	},
	Close: function() {
		document.getElementById('ingredient').style.display = 'none';
	}
};
