var host = "www.bungie.net";
var path = "/Platform/Destiny/";
var apiKey = "4c26e058e51742cc972a16cf20c6b6a3";
var xcsrf = "7875572953218462344";
const https = require('https');
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

exports.changeItem = function(itemID, account, character, callback) {
	var options = {
	  host: host,
	  path: path+'EquipItem/',
	  headers: {'X-API-Key': "57c5ff5864634503a0340ffdfbeb20c0", 'x-csrf': xcsrf},
		body: {"characterId": character, "membershipType": 1, "itemId": itemID}
	};
	console.log(options);
	var req = https.request(options, function(res) {
	  console.log("statusCode: ", res.statusCode);
    console.log("headers: ", res.headers);
		var message;

	  res.on('data', function(d) {
			message = d;
	  }).on('end', function() {
			callback(message);
    });
	});

	req.end();

	req.on('error', function(e) {
	  console.log('ERROR: ' + e.message);
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