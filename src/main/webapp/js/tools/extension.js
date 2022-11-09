//Object
//helpers
if(!Object.isObject) {
	//@ts-ignore
	Object.isObject = function(object) {
		return Object.prototype.toString.call(object) === '[object Object]';
	};
}
if(!Object.isEmpty) {
	Object.isEmpty = function(object) {
		for(const key in object) {
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
			for(let i = object_1.length - 1; i >= 0; i--) {
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
			for(const property in object_1) {
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
if(!Object.key) {
	Object.key = function(object, value) {
		for(const key in object) {
			if(object.hasOwnProperty(key) && object[key] === value) {
				return key;
			}
		}
		throw new Error('Object does not contains value');
	};
}
if(!Object.getObjectPathValue) {
	Object.getObjectPathValue = function(source_object, source_path) {
		let object = source_object;
		let path = source_path;
		while(path.includes('.')) {
			const current = path.substring(0, path.indexOf('.'));
			object = Function.isFunction(object[current]) ? object[current]() : object[current];
			path = path.substring(path.indexOf('.') + 1);
			if(object === undefined) {
				return undefined;
			}
		}
		return Function.isFunction(object[path]) ? object[path]() : object[path];
	};
}
if(!Object.getLastObjectInPath) {
	Object.getLastObjectInPath = function(source_object, source_path) {
		const object = source_object;
		const path = source_path;
		if(path.includes('.')) {
			const last_property = path.substring(path.lastIndexOf('.') + 1);
			return {object: Object.getObjectPathValue(object, path.substring(0, path.lastIndexOf('.'))), property: last_property};
		}
		return {object: object, property: path};
	};
}

//Function
//helpers
if(!Function.isFunction) {
	//@ts-ignore
	Function.isFunction = function(object) {
		return {}.toString.call(object) === '[object Function]';
	};
}

//String
//helpers
if(!String.isString) {
	//@ts-ignore
	String.isString = function(value) {
		//return toString.call(object) === '[object String]';
		return typeof(value) === 'string';
	};
}
//prototypes
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
String.prototype.interpolate = function(parameters) {
	const names = Object.keys(parameters);
	const values = Object.values(parameters);
	return new Function(...names, `return \`${this}\`;`)(...values);
};
String.prototype.getBytes = function() {
	const bytes = [];
	for(let i = 0; i < this.length; i++) {
		bytes.push(this.charCodeAt(i));
	}
	return bytes;
};

//Boolean
//prototypes
Boolean.prototype.compareTo = function(otherBoolean) {
	if(this === otherBoolean) {
		return 0;
	}
	return this ? -1 : 1;
};

//Number
//helpers
if(!Number.isNumber) {
	//@ts-ignore
	Number.isNumber = function isNumber(object) {
		return !isNaN(parseFloat(object)) && isFinite(object);
	};
}

//prototypes
Number.prototype.pad = function(length, pad) {
	return this.toString().padStart(length, pad || '0');
};
Number.prototype.compareTo = function(otherNumber) {
	return this.valueOf() - otherNumber;
};

//Array
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
	return this.findIndex(e => Object.equals(e, element));
};
Array.prototype.includesSame = function(element) {
	return this.indexOfSame(element) !== -1;
};
Array.prototype.includesAll = function(elements) {
	return elements.every(e => this.includes(e));
};
Array.prototype.includesOne = function(elements) {
	return elements.some(e => this.includes(e));
};
Array.prototype.pushAll = function(array) {
	this.push(...array);
};
Array.prototype.insert = function(index, item) {
	this.splice(index, 0, item);
};
Array.prototype.remove = function(from, to) {
	const rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	this.push.apply(this, rest);
};
Array.prototype.removeElement = function(element) {
	const index = this.indexOf(element);
	if(index !== -1) {
		this.splice(index, 1);
	}
};
Array.prototype.removeElements = function(elements) {
	for(let i = 0, length = elements.length; i < length; i++) {
		this.removeElement(elements[i]);
	}
};
Array.prototype.replace = function(oldElement, newElement) {
	const index = this.indexOf(oldElement);
	if(index !== -1) {
		this[index] = newElement;
	}
};

//Date
//helpers
if(!Date.isDate) {
	//@ts-ignore
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

//naive way to calculate differences
Date.getDifferenceInDays = function(start, stop) {
	const time = stop.getTime() - start.getTime();
	return time / Date.MS_IN_DAY;
};
Date.getDifferenceInHours = function(start, stop) {
	const time = stop.getTime() - start.getTime();
	return time / Date.MS_IN_HOUR;
};
Date.getDifferenceInMinutes = function(start, stop) {
	const time = stop.getTime() - start.getTime();
	return time / Date.MS_IN_MINUTE;
};
Date.getDifferenceInSeconds = function(start, stop) {
	const time = stop.getTime() - start.getTime();
	return time / Date.MS_IN_SECOND;
};
Date.getDifferenceInMilliseconds = function(start, stop) {
	return stop.getTime() - start.getTime();
};
Date.parseToDisplay = function(date) {
	const parts = date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
	//return data only if format is valid
	if(parts) {
		return new Date(`${parts[1]}/${parts[2]}/${parts[3]}`);
	}
	//to be consistent with native date API, return an invalid date
	return new Date('Invalid date');
};
(function() {
	const parts_regexp = /^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})/;
	Date.parseToFullDisplay = function(date) {
		const parts = date.match(parts_regexp);
		//return data only if format is valid
		if(parts) {
			return new Date(parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3]), parseInt(parts[4]), parseInt(parts[5]), parseInt(parts[6]));
		}
		//to be consistent with native date API, return an invalid date
		return new Date('Invalid date');
	};
	Date.parseToFullDisplayUTC = function(date) {
		const parts = date.match(parts_regexp);
		//return data only if format is valid
		if(parts) {
			return new Date(Date.UTC(parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3]), parseInt(parts[4]), parseInt(parts[5]), parseInt(parts[6])));
		}
		//to be consistent with native date API, return an invalid date
		return new Date('Invalid date');
	};
})();
Date.getDurationLiteral = function(duration) {
	let d, result = '';
	//write seconds
	d = duration % Date.SECONDS_IN_MINUTE;
	if(d) {
		result = `${d} seconds`;
	}
	duration = Math.floor(duration / Date.SECONDS_IN_MINUTE);
	if(duration < 1) {
		return result;
	}
	//write minutes
	d = duration % Date.MINUTES_IN_HOUR;
	if(d) {
		result = `${d} minutes${result ? ` ${result}` : ''}`;
	}
	duration = Math.floor(duration / Date.MINUTES_IN_HOUR);
	if(duration < 1) {
		return result;
	}
	//write hours
	d = duration % Date.HOURS_IN_DAY;
	if(d) {
		result = `${d} hours${result ? ` ${result}` : ''}`;
	}
	duration = Math.floor(duration / Date.HOURS_IN_DAY);
	if(duration < 1) {
		return result;
	}
	return `${duration} days${result ? ` ${result}` : ''}`;
};

//prototypes
Date.prototype.toDisplay = function() {
	return `${this.getFullYear()}-${(this.getMonth() + 1).pad(2)}-${this.getDate().pad(2)}`;
};
Date.prototype.toFullDisplay = function() {
	return `${this.toDisplay()} ${this.getHours().pad(2)}:${this.getMinutes().pad(2)}:${this.getSeconds().pad(2)}`;
};
Date.prototype.format = function(formatter) {
	return formatter.replaceObject({
		day: this.getDate().pad(2),
		month: (this.getMonth() + 1).pad(2),
		year: this.getFullYear(),
		hour: this.getHours().pad(2),
		minute: this.getMinutes().pad(2),
		second: this.getSeconds().pad(2),
		millisecond: this.getMilliseconds().pad(3)
	});
};
Date.prototype.toUTCDisplay = function() {
	return `${this.getUTCFullYear()}-${(this.getUTCMonth() + 1).pad(2)}-${this.getUTCDate().pad(2)}`;
};
Date.prototype.toUTCFullDisplay = function() {
	return `${this.toUTCDisplay()} ${this.getUTCHours().pad(2)}:${this.getUTCMinutes().pad(2)}:${this.getUTCSeconds().pad(2)}`;
};
Date.prototype.formatUTC = function(formatter) {
	return formatter.replaceObject({
		day: this.getUTCDate().pad(2),
		month: (this.getUTCMonth() + 1).pad(2),
		year: this.getUTCFullYear(),
		hour: this.getUTCHours().pad(2),
		minute: this.getUTCMinutes().pad(2),
		second: this.getUTCSeconds().pad(2),
		millisecond: this.getUTCMilliseconds().pad(3)
	});
};
Date.prototype.equals = function(otherDate) {
	return !!otherDate && this.getTime() === otherDate.getTime();
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
Date.prototype.addMilliseconds = function(milliseconds) {
	this.setTime(this.getTime() + milliseconds);
	return this;
};
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
//add time using a string
Date.prototype.addTimeString = function(time) {
	const time_regexp = /(-?\d+) ?([ymdHMS])/gi;
	let match;
	while((match = time_regexp.exec(time)) !== null) {
		let method;
		switch(match[2]) {
			case 'y': method = Date.prototype.addYears; break;
			case 'm': method = Date.prototype.addMonths; break;
			case 'd': method = Date.prototype.addDays; break;
			case 'H': method = Date.prototype.addHours; break;
			case 'M': method = Date.prototype.addMinutes; break;
			case 'S': method = Date.prototype.addSeconds; break;
		}
		if(method) {
			method.call(this, parseInt(match[1]));
		}
	}
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
	const real_age = this.getAge();

	let age = Math.round(real_age / Date.MS_IN_SECOND);
	if(age === 0) {
		return 'just now';
	}
	if(age === 1) {
		return 'a second ago';
	}
	if(age === -1) {
		return 'in a second';
	}
	if(age > 0 && age < Date.SECONDS_IN_MINUTE) {
		return `${age} seconds ago`;
	}
	if(age < 0 && -age < Date.SECONDS_IN_MINUTE) {
		return `in ${-age} seconds`;
	}

	age = Math.round(real_age / Date.MS_IN_MINUTE);
	if(age === 1) {
		return 'a minute ago';
	}
	if(age === -1) {
		return 'in a minute';
	}
	if(age > 0 && age < Date.MINUTES_IN_HOUR) {
		return `${age} minutes ago`;
	}
	if(age < 0 && -age < Date.MINUTES_IN_HOUR) {
		return `in ${-age} minutes`;
	}

	age = Math.round(real_age / Date.MS_IN_HOUR);
	if(age === 1) {
		return 'an hour ago';
	}
	if(age === -1) {
		return 'in an hour';
	}
	if(age > 0 && age < Date.HOURS_IN_DAY) {
		return `${age} hours ago`;
	}
	if(age < 0 && -age < Date.HOURS_IN_DAY) {
		return `in ${-age} hours`;
	}

	age = Math.round(real_age / Date.MS_IN_DAY);
	if(age === 1) {
		return 'a day ago';
	}
	if(age === -1) {
		return 'in a day';
	}
	if(age > 0) {
		return `${age} days ago`;
	}
	else {
		return `in ${-age} days`;
	}
};
