var axios = require('axios');
var md5 = require('md5');

function hashRequestData(request) {
	return md5(
		request.url +
			request.method +
			JSON.stringify(request.data) +
			JSON.stringify(request.headers) +
			JSON.stringify(request.params)
	);
}

var circularReferencePool = [];

function storeResponse(hash, res) {
	circularReferencePool = [];
	localStorage.setItem(
		hash,
		JSON.stringify(
			{
				date: Date.now(),
				value: res,
			},
			circularReferenceRemover
		)
	);
}

function getResponse(hash, ttl) {
	var cachedResponse = localStorage.getItem(hash);

	if (cachedResponse) {
        cachedResponse = JSON.parse(cachedResponse);

		if (cachedResponse.date < Date.now() + ttl) {
			return cachedResponse.value;
		}
	}

	return;
}

function circularReferenceRemover(key, value) {
	if (typeof value === 'object' && value !== null) {
		if (circularReferencePool.indexOf(value) !== -1) {
			try {
				return JSON.parse(JSON.stringify(value));
			} catch (error) {
				return;
			}
		}
		circularReferencePool.push(value);
	}
	return value;
}

var adapter = function(req) {
	return new Promise(function(resolve, reject) {
        var hash = hashRequestData(req);
		var cachedResponse = getResponse(hash, req.ttl);

		if (cachedResponse) {
			return resolve(cachedResponse);
        }

		axios.defaults.adapter
			.call(this, req)
			.then(function(res) {
				storeResponse(hash, res);
				resolve(res);
			})
			.catch(function(error) {
				reject(error);
			});
	});
};

module.exports = adapter;
