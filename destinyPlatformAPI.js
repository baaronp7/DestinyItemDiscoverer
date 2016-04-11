exports.getItems = function(page, callback) {
	var contentsJSON = null;
	var http = require('http');

	var options = {
	  host: 'www.bungie.net',
	  path: '/Platform/Destiny/Explorer/Items/?&buckets=PrimaryWeapon&count=10&page='+page,
	  headers: {'X-API-Key': '4c26e058e51742cc972a16cf20c6b6a3'}
	};

	var req = http.get(options, function(res) {
		console.log(options);
	  var bodyChunks = [];
	  res.on('data', function(chunk) {
			bodyChunks.push(chunk);
	  }).on('end', function() {
			contentsJSON = JSON.parse(Buffer.concat(bodyChunks));
			callback(contentsJSON);
	  })

	});

	req.on('error', function(e) {
	  console.log('ERROR: ' + e.message);
	});
};

exports.getItem = function(iId, callback) {
	var contentsJSON = null;
	var http = require('http');

	var options = {
	  host: 'www.bungie.net',
	  path: '/Platform/Destiny/Manifest/InventoryItem/'+iId+'/',
	  headers: {'X-API-Key': '4c26e058e51742cc972a16cf20c6b6a3'}
	};

	var req = http.get(options, function(res) {

	  var bodyChunks = [];
	  res.on('data', function(chunk) {
			bodyChunks.push(chunk);
	  }).on('end', function() {
			contentsJSON = Buffer.concat(bodyChunks);
			callback(contentsJSON);
	  })

	});

	req.on('error', function(e) {
	  console.log('ERROR: ' + e.message);
	});
};

exports.searchPlayer = function(memType, player, callback) {
	var contentsJSON = null;
	var http = require('http');

	var options = {
	  host: 'www.bungie.net',
	  path: '/Platform/Destiny/SearchDestinyPlayer/'+memType+'/'+player+'/',
	  headers: {'X-API-Key': '4c26e058e51742cc972a16cf20c6b6a3'}
	};

	var req = http.get(options, function(res) {

	  var bodyChunks = [];
	  res.on('data', function(chunk) {
			bodyChunks.push(chunk);
	  }).on('end', function() {
			contentsJSON = Buffer.concat(bodyChunks);
			callback(contentsJSON);
	  })

	});

	req.on('error', function(e) {
	  console.log('ERROR: ' + e.message);
	});
};

exports.getAccount = function(memType, memId, callback) {
	var contentsJSON = null;
	var http = require('http');

	var options = {
	  host: 'www.bungie.net',
	  path: '/Platform/Destiny/'+memType+'/Account/'+memId+'/',
	  headers: {'X-API-Key': '4c26e058e51742cc972a16cf20c6b6a3'}
	};

	var req = http.get(options, function(res) {

	  var bodyChunks = [];
	  res.on('data', function(chunk) {
			bodyChunks.push(chunk);
	  }).on('end', function() {
			contentsJSON = Buffer.concat(bodyChunks);
			callback(contentsJSON);
	  })

	});

	req.on('error', function(e) {
	  console.log('ERROR: ' + e.message);
	});
};

exports.getCharacter = function(callback) {
	var contentsJSON = null;
	var http = require('http');

	var options = {
	  host: 'www.bungie.net',
	  path: '/Platform/Destiny/1/Account/4611686018429670931/Character/2305843009298246930/',
	  headers: {'X-API-Key': '4c26e058e51742cc972a16cf20c6b6a3'}
	};

	var req = http.get(options, function(res) {

	  var bodyChunks = [];
	  res.on('data', function(chunk) {
			bodyChunks.push(chunk);
	  }).on('end', function() {
			contentsJSON = Buffer.concat(bodyChunks);
			callback(contentsJSON);
	  })

	});

	req.on('error', function(e) {
	  console.log('ERROR: ' + e.message);
	});
};
