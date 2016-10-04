var host = "www.bungie.net";
var path = "/Platform/Destiny/";
var apiKey = "4c26e058e51742cc972a16cf20c6b6a3";
var xcsrf = "7875572953218462344";
const https = require('https');
var request = require("request");
var async = require("async");
var _this = this;

exports.getAccount = function(memType, memId, callback) {
	var contentsJSON = null;

	var options = {
	  host: host,
	  path: path+memType+'/Account/'+memId+'/',
	  headers: {'X-API-Key': apiKey}
	};

	var req = https.get(options, function(res) {
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

exports.getCharacter = function(account, character, callback) {
	var contentsJSON = null;
	var http = require('http');

	var options = {
	  host: host,
	  path: path + "1/Account/" + account + '/Character/' + character + '/',
	  headers: {'X-API-Key': apiKey}
	};

	var req = https.get(options, function(res) {
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

exports.getItem = function(iId, callback) {
	var contentsJSON = null;
	
	var options = {
	  host: host,
	  path: path+'Manifest/InventoryItem/'+iId+'/',
	  headers: {'X-API-Key': apiKey}
	};

	var req = https.get(options, function(res) {

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

exports.getStats = function(memType, account, character, mode, callback) {
	var contentsJSON = null;
	
	var options = {
	  host: host,
	  path: path+'Stats/ActivityHistory/'+memType+'/'+account+'/'+character+'/?mode='+mode,
	  headers: {'X-API-Key': apiKey}
	};
	
	var req = https.get(options, function(res) {

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

exports.getAuthResponse = function(callback) {
	var options = { method: 'GET', url: "http://localhost:3000/auth/windows" };

	var authRequest = request(options, function (error, response, body) {
		if (error) throw new Error(error);
		console.log(body);
		callback(response);
	});
};

exports.getCookie = function(callback) {
	var request = require("request");
	var cookie = require('cookie');

	_this.getAuthResponse(function(authRes) {
		var cookies = authRes.headers['set-cookie'];
		cookies = cookie.parse(String(cookies));
		authCookie = cookies['HttpOnly,bungled'];
		console.log(authRes.headers);
		var opts = { method: 'POST',
			url: 'https://www.bungie.net/Platform/Destiny/EquipItem/',
			headers: 
			{ 'postman-token': '55af883d-2e70-e593-1898-b75d73068bc5',
				'cache-control': 'no-cache',
				'x-csrf': authCookie,
				'x-api-key': '4c26e058e51742cc972a16cf20c6b6a3' },
			body: '{characterId: \'2305843009219801924\', membershipType: 1, itemId: \'6917529098455518207\'}' };

		request(opts, function (error, response, body) {
			if (error) throw new Error(error);

			console.log(body);
			callback(body);
		});
	});
};

exports.changeItem = function(itemID, account, character, callback) {
	var request = require("request");

	var options = { method: 'POST',
		url: 'https://www.bungie.net/Platform/Destiny/EquipItem/',
		headers: 
		{ 'postman-token': '55af883d-2e70-e593-1898-b75d73068bc5',
			'cache-control': 'no-cache',
			'x-csrf': '7875572953218462344',
			'x-api-key': '4c26e058e51742cc972a16cf20c6b6a3' },
		body: '{characterId: \'2305843009219801924\', membershipType: 1, itemId: \'6917529098455518207\'}' };

	request(options, function (error, response, body) {
		if (error) throw new Error(error);

		console.log(body);
		callback(body);
	});
};

exports.character = function(character, accountJSON, callback) {
	var getCharacter = null;
	if(character == undefined) {
		var characters = JSON.parse(accountJSON).Response.data.characters;
		var lastPlayed = new Date(characters[0].characterBase.dateLastPlayed);
		getCharacter = characters[0].characterBase.characterId;

		for(var i = 1; i < characters.length; i++) {
			if(lastPlayed < new Date(characters[i].characterBase.dateLastPlayed)) {
				getCharacter = characters[i].characterBase.characterId;
			}
		}
	} else {
		getCharacter = character;
	}
	callback(getCharacter);
};

exports.items = function(json, callback) {
	var equipment = JSON.parse(json).Response.data.characterBase.peerView.equipment;
	var items = [];

	async.eachSeries(equipment, function(item, ccallback){
			_this.getItem(item.itemHash, function(itemJSON) {
				items.push(itemJSON);
				ccallback();
			});
		},
		function() {
			callback(items);
		}
	);
};