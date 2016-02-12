'use strict';

var Hash = {
	Encode : function(object) {
		var hash = '';
		for(var key in object) {
			if(object.hasOwnProperty(key)) {
				if(hash) {
					hash += '&';
				}
				hash += (key + '=' + object[key]);
			}
		}
		return '#' + hash;
	},
	Decode : function(hash) {
		//remove front dash
		var hash_content = hash.substring(1);
		//transform hash to an object
		var parameters = hash_content.split('&');
		var parameter;
		var data = {};
		var i = 0, length = parameters.length;
		for(; i < length; i++) {
			parameter = parameters[i].split('=');
			data[parameter[0]] = parameter.length > 1 ? parameter[1] : true;
		}
		return data;
	}
};