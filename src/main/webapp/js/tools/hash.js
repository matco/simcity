export const Hash = {
	Encode: function(object) {
		return `#${Object.entries(object).map(e => `${e[0]}=${e[1]}`).join('&')}`;
	},
	Decode: function(hash) {
		//remove front dash and transform hash to an object
		return Object.fromEntries(hash.substring(1).split('&').map(p => p.split('=')));
	}
};
