var axios = require('axios');
var adapter = require('..');

if (!global.localStorage) {
	localStorage = {
		setItem: function(key, value) {
			localStorage[key] = value;
		},

		getItem: function(key) {
			return localStorage[key];
		},
	};
}

var api = axios.create({
    adapter: adapter,
    ttl: 10000
});

(async function() {
	await api.get(
		'https://api.festbot.com/test/4842567782cdf2aa620f1060e1d8449f',
		{
			params: { foo: 'bar' },
		}
	);

	const mi = await api.get(
		'https://api.festbot.com/test/4842567782cdf2aa620f1060e1d8449f',
		{
			params: { foo: 'bar' },
		}
	);
})();