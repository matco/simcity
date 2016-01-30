'use strict';

//DOM
//Node
Node.prototype.clear = function() {
	while(this.firstChild) {
		this.removeChild(this.firstChild);
	}
	//allow chain
	return this;
};
Node.prototype.appendChilds = function(childs) {
	childs.forEach(Node.prototype.appendChild, this);
	//allow chain
	return this;
};
/*Node.prototype.up = function(tag) {
	if(this.parentNode.nodeName.toLowerCase() === tag.toLowerCase()) {
		return this.parentNode;
	}
	return this.parentNode.up(tag);
};*/

(function() {
	var methods = ['indexOf', 'includes', 'filter', 'forEach', 'every', 'map', 'some', 'sort', 'find'];
	//NodeList
	methods.forEach(function(method) {
		if(!NodeList.prototype.hasOwnProperty(method)) {
			NodeList.prototype[method] = Array.prototype[method];
		}
	});

	//DOMStringList
	methods.forEach(function(method) {
		if(!DOMStringList.prototype.hasOwnProperty(method)) {
			DOMStringList.prototype[method] = Array.prototype[method];
		}
	});
})();

//Element
Element.prototype.setAttributes = function(attributes) {
	if(attributes) {
		for(var attribute in attributes) {
			if(attributes.hasOwnProperty(attribute)) {
				this.setAttribute(attribute, attributes[attribute]);
			}
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
			for(var listener in listeners) {
				if(listeners.hasOwnProperty(listener)) {
					element.addEventListener(listener, listeners[listener], false);
				}
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
	var position = {left : this.offsetLeft, top : this.offsetTop};
	if(this.offsetParent) {
		var parent_position = this.offsetParent.getPosition();
		return {left : parent_position.left + position.left, top : parent_position.top + position.top};
	}
	return position;
};

//HTMLFormElement
HTMLFormElement.prototype.disable = function() {
	this.elements.forEach(HTMLElement.prototype.setAttribute.callbackize('disabled', 'disabled'));
};

HTMLFormElement.prototype.enable = function() {
	this.elements.forEach(HTMLElement.prototype.removeAttribute.callbackize('disabled'));
};

//HTMLSelectElement
HTMLSelectElement.prototype.fill = function(entries, blank_entry, selected_entries) {
	//transform entries if an array has been provided
	var options;
	if(Array.isArray(entries)) {
		options = {};
		var i = 0, length = entries.length, entry;
		for(; i < length; i++) {
			//html options can only be strings
			entry = entries[i] + '';
			options[entry] = entry;
		}
	}
	else {
		options = Object.clone(entries);
	}
	//transform selected entries
	var selected_options = selected_entries ? Array.isArray(selected_entries) ? selected_entries : [selected_entries] : [];
	//clean and update existing options
	var children = Array.prototype.slice.call(this.childNodes);
	for(var i = 0; i < children.length; i++) {
		var option = children[i];
		//do not manage empty option here
		if(option.value) {
			//remove option if it is no more needed
			if(!options.hasOwnProperty(option.value)) {
				this.removeChild(option);
			}
			//remove option from list of options to add
			else {
				delete options[option.value];
			}
		}
		//unselect or select option according to new selection
		if(!selected_options.includes(option.value)) {
			option.removeAttribute('selected');
		}
		else {
			option.setAttribute('selected', 'selected');
		}
	}
	//manage blank option
	//look for current blank option
	var blank_option = this.childNodes.find(function(option) {return !option.value;});
	//remove blank option if it has been found and is not needed
	if(blank_option && !blank_entry) {
		this.removeChild(blank_option);
	}
	//add blank option if it has not been found and is needed
	else if(!blank_option && blank_entry) {
		this.insertBefore(document.createElement('option'), this.firstChild);
	}
	//add missing options
	//TODO do not append missing options at the end of the list
	var properties;
	for(var option in options) {
		if(options.hasOwnProperty(option)) {
			properties = {value : option};
			if(selected_options.includes(properties.value)) {
				properties.selected = 'selected';
			}
			this.appendChild(document.createFullElement('option', properties, options[option]));
		}
	}
	//allow chain
	return this;
};
HTMLSelectElement.prototype.fillObjects = function(objects, value_property, label_property, blank_entry, selected_entries) {
	var entries = {};
	var i = 0, length = objects.length;
	for(; i < length; i++) {
		var object = objects[i];
		var value = Function.isFunction(value_property) ? value_property.call(object) : object[value_property];
		var label = Function.isFunction(label_property) ? label_property.call(object) : object[label_property];
		entries[value] = label;
	}
	return this.fill(entries, blank_entry, selected_entries);
};

//HTMLCollection
HTMLCollection.prototype.indexOf = Array.prototype.indexOf;
HTMLCollection.prototype.filter = Array.prototype.filter;
HTMLCollection.prototype.forEach = Array.prototype.forEach;
HTMLCollection.prototype.every = Array.prototype.every;
HTMLCollection.prototype.map = Array.prototype.map;
HTMLCollection.prototype.some = Array.prototype.some;
HTMLCollection.prototype.find = Array.prototype.find;

//Storage
Storage.prototype.setObject = function(key, value) {
	this.setItem(key, JSON.stringify(value));
};
Storage.prototype.getObject = function(key) {
	var item = this.getItem(key);
	return item ? JSON.parse(item) : undefined;
};

//Event
Event.stop = function(event) {
	if(event) {
		event.stopPropagation();
		event.preventDefault();
	}
};
