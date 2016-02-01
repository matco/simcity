'use strict';

//object
//helpers
if(!Object.isObject) {
	Object.isObject = function(object) {
		return Object.prototype.toString.call(object) === '[object Object]';
	};
}
if(!Object.isEmpty) {
	Object.isEmpty = function(object) {
		for(var key in object) {
			if(object.hasOwnProperty(key)) {
				return false;
			}
		}
		return true;
	};
}
if(!Object.equals) {
	Object.equals = function(object_1, object_2) {
		if(object_1 === object_2) {
			return true;
		}
		if(typeof(object_1) !== typeof(object_2)) {
			return false;
		}
		if(object_1 === undefined || object_1 === null || object_2 === undefined || object_2 === null) {
			return false;
		}
		//objects with equals method
		if(object_1.equals) {
			return object_1.equals(object_2);
		}
		if(object_2.equals) {
			return object_2.equals(object_1);
		}
		//arrays
		if(Array.isArray(object_1) && Array.isArray(object_2)) {
			if(object_1.length !== object_2.length) {
				return false;
			}
			for(var i = object_1.length - 1; i >= 0; i--) {
				if(!Object.equals(object_1[i], object_2[i])) {
					return false;
				}
			}
			return true;
		}
		//objects
		if(Object.isObject(object_1) && Object.isObject(object_2)) {
			if(!Object.equals(Object.keys(object_1), Object.keys(object_2))) {
				return false;
			}
			for(var property in object_1) {
				if(object_1.hasOwnProperty(property)) {
					if(!Object.equals(object_1[property], object_2[property])) {
						return false;
					}
				}
			}
			return true;
		}
		return false;
	};
}
if(!Object.clone) {
	Object.clone = function(object) {
		return JSON.parse(JSON.stringify(object));
	};
}
if(!Object.values) {
	Object.values = function(object) {
		var key, values = [];
		for(key in object) {
			if(object.hasOwnProperty(key)) {
				values.push(object[key]);
			}
		}
		return values;
	};
}
if(!Object.key) {
	Object.key = function(object, value) {
		for(var key in object) {
			if(object.hasOwnProperty(key) && object[key] === value) {
				return key;
			}
		}
		throw new Error('Object does not contains value');
	};
}
if(!Object.update) {
	Object.update = function(object, values) {
		for(var key in values) {
			if(values.hasOwnProperty(key)) {
				object[key] = values[key];
			}
		}
	};
}
if(!Object.getObjectPathValue) {
	Object.getObjectPathValue = function(source_object, source_path) {
		var object = source_object;
		var path = source_path;
		while(path.includes('.')) {
			var current = path.substring(0, path.indexOf('.'));
			object = Function.isFunction(object[current]) ? object[current]() : object[current];
			path = path.substring(path.indexOf('.') + 1);
		}
		return Function.isFunction(object[path]) ? object[path]() : object[path];
	};
}
if(!Object.getLastObjectInPath) {
	Object.getLastObjectInPath = function(source_object, source_path) {
		var object = source_object;
		var path = source_path;
		if(path.includes('.')) {
			var last_property = path.substring(path.lastIndexOf('.') + 1);
			return {object : Object.getObjectPathValue(object, path.substring(0, path.lastIndexOf('.'))), property : last_property};
		}
		return {object : object, property : path};
	};
}

//function
//helpers
if(!Function.isFunction) {
	Function.isFunction = function(object) {
		return {}.toString.call(object) === '[object Function]';
	};
}

//prototypes
Function.prototype.negatize = function() {
	var original = this;
	return function() {
		return !!!original.apply(undefined, arguments);
	};
};
Function.prototype.callbackize = function() {
	var original = this;
	var args = arguments;
	return function(object) {
		return original.apply(object, args);
	};
};
Function.prototype.unmemoize = function() {
	throw new Error('Unable to unmemoize a function that has not been memoized');
};
Function.prototype.memoize = function() {
	var original = this;
	var cache = {};

	var memoized = function() {
		var parameters = [];
		//add context in parameters
		if(this) {
			if(!this.serialize) {
				throw new Error('Unable to memoize method in object is not serializable (i.e. it has no serialize method)');
			}
			parameters.push(this.serialize());
		}
		else {
			parameters.push(undefined);
		}
		//add function arguments
		parameters.pushAll(Array.prototype.slice.call(arguments));

		if(!(parameters in cache)) {
			cache[parameters] = original.apply(this, arguments);
		}

		return cache[parameters];
	};

	memoized.unmemoize = function() {
		return original;
	};

	return memoized;
};

//string
//helpers
if(!String.isString) {
	String.isString = function(object) {
		//return toString.call(object) === '[object String]';
		return typeof(object) === 'string';
	};
}
//prototypes
String.prototype.leftPad = function(length, pad) {
	//clone string
	var string = this + '';
	while(string.length < length) {
		string = pad + string;
	}
	return string;
};
String.prototype.rightPad = function(length, pad) {
	var string = this;
	while(string.length < length) {
		string += pad;
	}
	return string;
};
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.reverse = function() {
	return this.split('').reverse().join('');
};
String.prototype.nocaseIncludes = function(string) {
	return this.toLowerCase().includes(string.toLowerCase());
};
String.prototype.compareTo = function(otherString) {
	return this.localeCompare(otherString);
};
String.prototype.replaceObject = function(object) {
	return this.replace(/\$\{([A-Za-z._]+)\}/g, function(match, path) {
		return Object.getObjectPathValue(object, path);
	});
};
String.prototype.startsWith = function(string) {
	return this.slice(0, string.length) === string;
};
String.prototype.getBytes = function() {
	var bytes = [];
	for(var i = 0; i < this.length; i++) {
		bytes.push(this.charCodeAt(i));
	}
	return bytes;
};

//boolean
//prototypes
Boolean.prototype.compareTo = function(otherBoolean) {
	if(this === otherBoolean) {
		return 0;
	}
	return this ? -1 : 1;
};

//number
//helpers
if(!Number.isNumber) {
	Number.isNumber = function isNumber(object) {
		return !isNaN(parseFloat(object)) && isFinite(object);
	};
}

//prototypes
Number.prototype.pad = function(length, pad) {
	return this.toString().leftPad(length, pad || '0');
};
Number.prototype.compareTo = function(otherNumber) {
	return this - otherNumber;
};

//array
//helpers
Array.objectFilter = function(properties) {
	return function(object) {
		for(var property in properties) {
			if(properties.hasOwnProperty(property)) {
				//if object property is a function, call it only if the asked value is not a function too
				var object_value = Function.isFunction(object[property]) && !Function.isFunction(properties[property]) ? object[property].call(object) : object[property];
				if(object_value !== properties[property]) {
					return false;
				}
			}
		}
		return true;
	};
};
Array.objectMap = function(property) {
	return function(object) {
		return Function.isFunction(object[property]) ? object[property].call(object) : object[property];
	};
};

//prototypes
Array.prototype.isEmpty = function() {
	return this.length === 0;
};
Array.prototype.last = function() {
	return this[this.length - 1];
};
Array.prototype.first = function() {
	return this[0];
};
Array.prototype.indexOfSame = function(element) {
	var i = 0, length = this.length;
	for(; i < length; i++) {
		if(Object.equals(this[i], element)) {
			return i;
		}
	}
	return -1;
};
if(!Array.prototype.includes) {
	Array.prototype.includes = function(element) {
		return this.indexOf(element) !== -1;
	};
}
Array.prototype.includesSame = function(element) {
	return this.indexOfSame(element) !== -1;
};
Array.prototype.includesAll = function(elements) {
	for(var i = elements.length - 1; i >= 0; i--) {
		if(!this.includes(elements[i])) {
			return false;
		}
	}
	return true;
};
Array.prototype.includesOne = function(elements) {
	for(var i = elements.length - 1; i >= 0; i--) {
		if(this.includes(elements[i])) {
			return true;
		}
	}
	return false;
};
Array.prototype.pushAll = function(array) {
	var i = 0, length = array.length;
	for(; i < length; i++) {
		this.push(array[i]);
	}
};
Array.prototype.insert = function(index, item) {
	this.splice(index, 0, item);
};
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	this.push.apply(this, rest);
};
Array.prototype.removeElement = function(element) {
	var index = this.indexOf(element);
	if(index !== -1) {
		this.splice(index, 1);
	}
};
Array.prototype.removeElements = function(elements) {
	for(var i = 0, length = elements.length; i < length; i++) {
		this.removeElement(elements[i]);
	}
};
Array.prototype.replace = function(oldElement, newElement) {
	var index = this.indexOf(oldElement);
	if(index !== -1) {
		this[index] = newElement;
	}
};
if(!Array.prototype.find) {
	Array.prototype.find = function(callback, thisArgument) {
		var i = 0, length = this.length;
		for(; i < length; i++) {
			var element = this[i];
			if(callback.call(thisArgument, element, i, this)) {
				return element;
			}
		}
		return undefined;
	};
}

//date
//helpers
if(!Date.isDate) {
	Date.isDate = function(object) {
		return Object.prototype.toString.call(object) === '[object Date]';
	};
}
if(!Date.isValidDate) {
	Date.isValidDate = function(date) {
		return Date.isDate(date) && !isNaN(date.getTime());
	};
}

Date.SECONDS_IN_MINUTE = 60;
Date.MINUTES_IN_HOUR = 60;
Date.HOURS_IN_DAY = 24;

Date.MS_IN_SECOND = 1000;
Date.MS_IN_MINUTE = Date.SECONDS_IN_MINUTE * Date.MS_IN_SECOND;
Date.MS_IN_HOUR = Date.MINUTES_IN_HOUR * Date.MS_IN_MINUTE;
Date.MS_IN_DAY = Date.HOURS_IN_DAY * Date.MS_IN_HOUR;

Date.locale = {
	en : {
		day_names : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		day_names_short : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		month_names : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		month_names_short : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	},
	fr : {
		day_names : ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
		day_names_short : ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
		month_names : ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Decembre'],
		month_names_short : ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Dec']
	}
};

//naive way to calculate differences
Date.getDifferenceInDays = function(start, stop) {
	var time = stop.getTime() - start.getTime();
	return time / Date.MS_IN_DAY;
};
Date.getDifferenceInHours = function(start, stop) {
	var time = stop.getTime() - start.getTime();
	return time / Date.MS_IN_HOUR;
};
Date.getDifferenceInMinutes = function(start, stop) {
	var time = stop.getTime() - start.getTime();
	return time / Date.MS_IN_MINUTE;
};
Date.getDifferenceInSeconds = function(start, stop) {
	var time = stop.getTime() - start.getTime();
	return time / Date.MS_IN_SECOND;
};
Date.parseToDisplay = function(date) {
	var parts = date.match(/^(\d{1,2}).(\d{1,2}).(\d{4})$/);
	//return data only if format is valid
	if(parts) {
		return new Date(parts[3] + '/' + parts[2] + '/' + parts[1]);
	}
};
Date.parseToFullDisplay = function(date) {
	var parts = date.match(/^(\d{1,2}).(\d{1,2}).(\d{4}) (\d{1,2}):(\d{1,2}):(\d{1,2})/);
	//return data only if format is valid
	if(parts) {
		return new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5], parts[6]);
	}
};
Date.parseToFullDisplayUTC = function(date) {
	var parts = date.match(/^(\d{1,2}).(\d{1,2}).(\d{4}) (\d{1,2}):(\d{1,2}):(\d{1,2})/);
	return new Date(Date.UTC(parts[3], parts[2] - 1, parts[1], parts[4], parts[5], parts[6]));
};
Date.getDurationLiteral = function(duration) {
	var d, result = '';
	//write seconds
	d = duration % Date.SECONDS_IN_MINUTE;
	if(d) {
		result = d + ' seconds';
	}
	duration = Math.floor(duration / Date.SECONDS_IN_MINUTE);
	if(duration < 1) {
		return result;
	}
	//write minutes
	d = duration % Date.MINUTES_IN_HOUR;
	if(d) {
		result = d + ' minutes' + (result ? ' ' + result : '');
	}
	duration = Math.floor(duration / Date.MINUTES_IN_HOUR);
	if(duration < 1) {
		return result;
	}
	//write hours
	d = duration % Date.HOURS_IN_DAY;
	if(d) {
		result = d + ' hours' + (result ? ' ' + result : '');
	}
	duration = Math.floor(duration / Date.HOURS_IN_DAY);
	if(duration < 1) {
		return result;
	}
	return duration + ' days' + (result ? ' ' + result : '');
};

//prototypes
Date.prototype.toDisplay = function() {
	return this.getDate().pad(2) + '.' + (this.getMonth() + 1).pad(2) + '.' + this.getFullYear();
};
Date.prototype.toFullDisplay = function() {
	return this.toDisplay() + ' ' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2);
};
Date.prototype.format = function(formatter) {
	return formatter.replaceObject({
		day : this.getDate().pad(2),
		month : (this.getMonth() + 1).pad(2),
		year : this.getFullYear(),
		hour : this.getHours().pad(2),
		minute : this.getMinutes().pad(2),
		second : this.getSeconds().pad(2),
		millisecond : this.getMilliseconds().pad(3)
	});
};
Date.prototype.getDayName = function(language) {
	var lang = language && Date.locale.hasOwnProperty(language) ? language : 'en';
	return Date.locale[lang].day_names[this.getDay()];
};
Date.prototype.getDayNameShort = function(language) {
	var lang = language && Date.locale.hasOwnProperty(language) ? language : 'en';
	return Date.locale[lang].day_names_short[this.getDay()];
};
Date.prototype.getMonthName = function(language) {
	var lang = language && Date.locale.hasOwnProperty(language) ? language : 'en';
	return Date.locale[lang].month_names[this.getMonth()];
};
Date.prototype.getMonthNameShort = function(language) {
	var lang = language && Date.locale.hasOwnProperty(language) ? language : 'en';
	return Date.locale[lang].month_names_short[this.getMonth()];
};
Date.prototype.compareTo = function(otherDate) {
	return this.getTime() - otherDate.getTime();
};
Date.prototype.clone = function() {
	return new Date(this.getTime());
};
Date.prototype.isBefore = function(date) {
	return date.getTime() - this.getTime() > 0;
};
Date.prototype.isAfter = function(date) {
	return date.isBefore(this);
};
//add duration
Date.prototype.addSeconds = function(seconds) {
	this.setTime(this.getTime() + seconds * Date.MS_IN_SECOND);
	return this;
};
Date.prototype.addMinutes = function(minutes) {
	this.setTime(this.getTime() + minutes * Date.MS_IN_MINUTE);
	return this;
};
Date.prototype.addHours = function(hours) {
	this.setTime(this.getTime() + hours * Date.MS_IN_HOUR);
	return this;
};
Date.prototype.addDays = function(days) {
	this.setTime(this.getTime() + days * Date.MS_IN_DAY);
	return this;
};
//add period
Date.prototype.addMonths = function(months) {
	this.setMonth(this.getMonth() + months);
	return this;
};
Date.prototype.addYears = function(years) {
	this.setFullYear(this.getFullYear() + years);
	return this;
};
//round
Date.prototype.roundToDay = function() {
	this.roundToHour();
	if(this.getHours() > (Date.HOURS_IN_DAY / 2)) {
		this.addDays(1);
	}
	this.setHours(0);
	return this;
};
Date.prototype.roundToHour = function() {
	this.roundToMinute();
	if(this.getMinutes() >= (Date.MINUTES_IN_HOUR / 2)) {
		this.addHours(1);
	}
	this.setMinutes(0);
	return this;
};
Date.prototype.roundToMinute = function() {
	if(this.getSeconds() >= (Date.SECONDS_IN_MINUTE / 2)) {
		this.addMinutes(1);
	}
	this.setSeconds(0);
	return this;
};

Date.prototype.getAge = function() {
	return new Date().getTime() - this.getTime();
};
Date.prototype.getAgeLiteral = function() {
	var real_age = this.getAge();
	if(real_age < 0) {
		throw new Error('Date in the future not supported');
	}
	var age = Math.round(real_age / Date.MS_IN_SECOND);
	if(age === 0) {
		return 'just now';
	}
	if(age === 1) {
		return 'a second ago';
	}
	if(age < Date.SECONDS_IN_MINUTE) {
		return age + ' seconds ago';
	}
	age = Math.round(real_age / Date.MS_IN_MINUTE);
	if(age === 1) {
		return 'a minute ago';
	}
	if(age < Date.MINUTES_IN_HOUR) {
		return age + ' minutes ago';
	}
	age = Math.round(real_age / Date.MS_IN_HOUR);
	if(age === 1) {
		return 'an hour ago';
	}
	if(age < Date.HOURS_IN_DAY) {
		return age + ' hours ago';
	}
	age = Math.round(real_age / Date.MS_IN_DAY);
	if(age === 1) {
		return 'a day ago';
	}
	return age + ' days ago';
};