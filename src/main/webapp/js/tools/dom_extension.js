import './extension.js';

//Generic
['indexOf', 'first', 'last', 'isEmpty', 'includes', 'slice', 'sort', 'forEach', 'map', 'find', 'filter', 'every', 'some'].forEach(method => {
	//NodeList
	if(!NodeList.prototype.hasOwnProperty(method)) {
		NodeList.prototype[method] = Array.prototype[method];
	}
	//DOMStringList
	if(!DOMStringList.prototype.hasOwnProperty(method)) {
		DOMStringList.prototype[method] = Array.prototype[method];
	}
	//HTMLCollection
	if(!HTMLCollection.prototype.hasOwnProperty(method)) {
		HTMLCollection.prototype[method] = Array.prototype[method];
	}
});

//DOM
//Node
Node.prototype.empty = function() {
	while(this.firstChild) {
		this.removeChild(this.firstChild);
	}
	//allow chain
	return this;
};
Node.prototype.appendChildren = function(children) {
	children.forEach(Node.prototype.appendChild, this);
	//allow chain
	return this;
};
/*Node.prototype.up = function(tag) {
	if(this.parentNode.nodeName.toLowerCase() === tag.toLowerCase()) {
		return this.parentNode;
	}
	return this.parentNode.up(tag);
};*/

//Element
Element.prototype.empty = function(selector) {
	let children = this.childNodes.slice();
	if(selector) {
		children = children.filter(c => c.nodeType === Node.ELEMENT_NODE && /**@type {HTMLElement}*/ (c).matches(selector));
	}
	children.forEach(c => this.removeChild(c));
	//allow chain
	return this;
};
Element.prototype.setAttributes = function(attributes) {
	if(attributes) {
		for(const [attribute, value] of Object.entries(attributes)) {
			this.setAttribute(attribute, value);
		}
	}
	//allow chain
	return this;
};

//Document
(function() {
	function enhance_element(element, attributes, text, listeners) {
		element.setAttributes(attributes);
		if(text !== undefined) {
			element.appendChild(this.createTextNode(text));
		}
		if(listeners) {
			for(const [event, listener] of Object.entries(listeners)) {
				element.addEventListener(event, listener, false);
			}
		}
		return element;
	}

	Document.prototype.createFullElement = function(tag, attributes, text, listeners) {
		return enhance_element.call(this, this.createElement(tag), attributes, text, listeners);
	};
	Document.prototype.createFullElementNS = function(ns, tag, attributes, text, listeners) {
		return enhance_element.call(this, this.createElementNS(ns, tag), attributes, text, listeners);
	};
})();

//HTML
//HTMLElement
HTMLElement.prototype.getPosition = function() {
	const position = {left: this.offsetLeft, top: this.offsetTop};
	if(this.offsetParent) {
		const parent_position = this.offsetParent.getPosition();
		return {left: parent_position.left + position.left, top: parent_position.top + position.top};
	}
	return position;
};

//HTMLFormElement
HTMLFormElement.prototype.disable = function() {
	this.elements.forEach(e => e.setAttribute('disabled', 'disabled'));
};

HTMLFormElement.prototype.enable = function() {
	this.elements.forEach(e => e.removeAttribute('disabled'));
};

//HTMLSelectElement
/**
 * @type {Function}
 * @param {string[][] | string[]} entries - List of entries
 * @param {boolean} [blank_entry] - Add or not a blank entry
 * @param {string[] | string} [selected_entries] - Entries that will be selected
 * @returns {HTMLSelectElement} - The select element that will be filled
 */
HTMLSelectElement.prototype.fill = function(entries, blank_entry, selected_entries) {
	const options = entries.map(e => Array.isArray(e) ? e : [e, e]);
	//transform selected entries
	const selected_options = selected_entries ? Array.isArray(selected_entries) ? selected_entries : [selected_entries] : [];
	//clean existing options and handle selection status
	const existing_options = Array.prototype.slice.call(this.children);
	for(const existing_option of existing_options) {
		//do not manage empty option here
		if(existing_option.value) {
			//remove option if it is no longer needed
			const matching_option = options.find(o => o[0] === existing_option.value);
			if(!matching_option || matching_option[1] !== existing_option.text) {
				this.removeChild(existing_option);
			}
		}
		//unselect or select option according to new selection
		if(!selected_options.includes(existing_option.value)) {
			existing_option.removeAttribute('selected');
		}
		else {
			existing_option.setAttribute('selected', 'selected');
		}
	}
	//add missing options at the appropriate location
	for(const [value, text] of options) {
		//find existing option if any
		const existing_option = existing_options.find(o => o.value === value);
		if(existing_option) {
			//re-add existing option at the end of the select to have the good order at the end or the process
			this.appendChild(existing_option);
			continue;
		}
		//option does not already exist and must be added
		const properties = {value: value};
		if(selected_options.includes(properties.value)) {
			properties.selected = 'selected';
		}
		//add option at the end of the select to have the good order at the end or the process
		this.appendChild(document.createFullElement('option', properties, text));
	}
	//manage blank option
	//look for current blank option
	const blank_option = this.childNodes.find(o => !o.value);
	//remove blank option if it has been found and is not needed
	if(blank_option && !blank_entry) {
		this.removeChild(blank_option);
	}
	//add blank option if it has not been found and is needed
	else if(!blank_option && blank_entry) {
		this.insertBefore(document.createElement('option'), this.firstChild);
	}
	//manage value of select if no selected options have been provided
	//if no selected options have been provided, do not touch anything
	//HTML does not allow to set multiple values
	//select.value will be set automatically to the first selected option
	//this is the standard HTML behavior: the value of the select is equal to the first selected option
	if(selected_options.isEmpty()) {
		//otherwise select the blank or the first entry as HTML would automatically do when a select appears on a page
		//in this case, this must be managed manually because some options could have be re-used and may have been selected
		if(!blank_entry && !this.multiple && options.length > 0) {
			this.value = options.keys().next().value;
		}
		else {
			this.value = undefined;
		}
	}
	//allow chain
	return this;
};

/**
 * @type {Function}
 * @param {any[]} objects - List of objects used to fill the select
 * @param {string|Function} value_property - Property of the object or function applied to the object to obtain the object value
 * @param {string|Function} label_property - Property of the object or function applied to the object to obtain the object label
 * @param {boolean} [blank_entry] - Add or not a blank entry
 * @param {string[] | string} [selected_entries] - Entries that will be selected
 * @returns {HTMLSelectElement} - The select element that will be filled
 */
HTMLSelectElement.prototype.fillObjects = function(objects, value_property, label_property, blank_entry, selected_entries) {
	/**@type {[string,string][]}*/
	const entries = objects.map(o => {
		const value = Function.isFunction(value_property) ? value_property.call(o) : o[value_property];
		const label = Function.isFunction(label_property) ? label_property.call(o) : o[label_property];
		return [value, label];
	});
	return this.fill(entries, blank_entry, selected_entries);
};

//HTMLDataListElement
/**
 * @type {Function}
 * @param {string[]} entries - List of entries
 * @returns {HTMLDataListElement} - The select element that will be filled
 */
HTMLDataListElement.prototype.fill = function(entries) {
	//clean existing options and handle selection status
	const existing_options = Array.prototype.slice.call(this.children);
	for(const existing_option of existing_options) {
		if(existing_option.value) {
			//remove option if it is no longer needed
			if(!entries.includes(existing_option.value)) {
				this.removeChild(existing_option);
			}
		}
	}
	//add missing options at the appropriate location
	for(const value of entries) {
		//find existing option if any
		const existing_option = existing_options.find(o => o.value === value);
		if(existing_option) {
			//re-add existing option at the end of the select to have the good order at the end or the process
			this.appendChild(existing_option);
			continue;
		}
		//option does not already exist and must be added
		//add option at the end of the select to have the good order at the end or the process
		this.appendChild(document.createFullElement('option', {value: value}));
	}
	//allow chain
	return this;
};

/**
 * @type {Function}
 * @param {string[]} objects - List of objects used to fill the select
 * @param {string|Function} property - Property of the object or function applied to the object to obtain the value
 * @returns {HTMLDataListElement} - The select element that will be filled
 */
HTMLDataListElement.prototype.fillObjects = function(objects, property) {
	const options = objects.map(o => Function.isFunction(property) ? property.call(o) : o[property]);
	return this.fill(options);
};

//Storage
Storage.prototype.setObject = function(key, value) {
	this.setItem(key, JSON.stringify(value));
};
Storage.prototype.getObject = function(key) {
	const item = this.getItem(key);
	return item ? JSON.parse(item) : undefined;
};

//Event
Event.prototype.stop = function() {
	this.stopPropagation();
	this.preventDefault();
};
