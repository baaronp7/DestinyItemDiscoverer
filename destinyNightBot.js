var host = "www.bungie.net";
var path = "/Platform/Destiny/";
var apiKey = "4c26e058e51742cc972a16cf20c6b6a3";
var xcsrf = "7875572953218462344";
const https = require('https');
var async = require("async");
var httpsf = require('follow-redirects').https;
var Cookie = require('cookie');
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

exports.getCharacter = function(memType, account, character, callback) {
	var contentsJSON = null;
	var http = require('http');

	var options = {
	  host: host,
	  path: path + memType+"/Account/" + account + '/Character/' + character + '/',
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

exports.getSong = function(url, callback) {
	var request = require("request");

	var options = { method: 'GET',
		url: url,
		qs: { raw: '1' },
		headers: { 'cache-control': 'no-cache' }
	};

	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		callback(body);
	});
};

exports.getStatsHistory = function(memType, account, character, mode, count, callback) {
	var contentsJSON = null;
	
	var options = {
	  host: host,
	  path: path+'Stats/ActivityHistory/'+memType+'/'+account+'/'+character+'/?mode='+mode,
	  headers: {'X-API-Key': apiKey}
	};

	if(count !== null || count !== undefined) {
		options.path = options.path+'&count='+count;
	}

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

exports.getRaidHistory = function(stats, raid, difficulty, callback) {
	var difficultyArr = {
		roi: {normal: 260765522, heroic: 1387993552}, 
		ttk: {normal: 1733556769, heroic: 3534581229}
	};
	var diff = difficultyArr[raid][difficulty];
	var raidStats = {raidCount: 0, raidsCompleted: 0, kills: 0, deaths: 0, assists: 0, kd: 0, kad: 0};
	
	var activities = JSON.parse(stats).Response.data.activities;
	for(var i = 0; i < activities.length; i++) {
		if(activities[i].activityDetails.referenceId == diff) {
			raidStats.raidCount++;
			if(activities[i].values.completed.basic.value == 1) {
				raidStats.raidsCompleted++;
			}
			raidStats.kills += activities[i].values.kills.basic.value;
			raidStats.deaths += activities[i].values.deaths.basic.value;
			raidStats.assists += activities[i].values.assists.basic.value;
		}
	}
	raidStats.kd = raidStats.kills/raidStats.deaths;
	if(isNaN(raidStats.kd)) {
		raidStats.kd = 0;
	}
	raidStats.kd = raidStats.kd.toFixed(2);
	raidStats.kad = (raidStats.kills+raidStats.assists)/raidStats.deaths;
	if(isNaN(raidStats.kad)) {
		raidStats.kad = 0;
	}
	raidStats.kad = raidStats.kad.toFixed(2);
	callback(raidStats);
};

exports.getStats = function(memType, account, character, mode, callback) {
	var contentsJSON = null;
	
	var options = {
	  host: host,
	  path: path+'Stats/'+memType+'/'+account+'/'+character+'/?modes='+mode+'&lc=en',
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

exports.getCurrentViewers = function(callback) {
	var request = require("request");

	var options = { method: 'GET',
		url: 'https://api.twitch.tv/kraken/streams',
		qs: { channel: 'akabennyp' },
		headers: { 'cache-control': 'no-cache', 'client-id': '356183dj0szhj1di32a4td2rcqs40qp' } 
	};

	request(options, function (error, response, body) {
		if (error) throw new Error(error);

		console.log(body);
		callback(body);
	});
};

exports.getLastFollower = function(callback) {
	var request = require("request");

	var options = { method: 'GET',
		url: 'https://api.twitch.tv/kraken/channels/akabennyp/follows',
		qs: { limit: '1' },
		headers: { 'cache-control': 'no-cache', 'client-id': '356183dj0szhj1di32a4td2rcqs40qp' }
	};

	request(options, function (error, response, body) {
		if (error) throw new Error(error);

		console.log(body);
		callback(body);
	});
}

exports.getLoginInfo = function(callback) {
	var options;

	var req = httpsf.get('https://www.bungie.net/en/User/SignIn/Xuid', function(res) {
		res.on('data', function(body) {
			var re = /id\="i0327" value\="(.*?)"\//ig;
			var result = re.exec(body);

			if (result == null) {
				callback("Unexpected error: re found nothing in body. Body text: " + body);
				return;
			}

			var ppft = result[1];
			var re2 = /urlPost:\'(.*?)\'/ig;
			result = re2.exec(body);
			var postHost = result[1].substring(8, 22);
			var postPath = result[1].substring(22);
			var url = result[1];
			console.log(url);

			options = {
				/*
				host: postHost,
				path: postPath,*/
				url: url,
				headers: {'X-API-Key': apiKey},
				maxRedirects: 10,
				form: {
					login: 'baaronp7@hotmail.com',
					passwd: 'Acts2.38',
					KMSI: 1,
					PPFT: ppft
				},
				followAllRedirects: true
			};

	  }).on('end', function() {
			callback(options);
	  });

		req.on('error', function(e) {
			console.log('ERROR: ' + e.message);
		});
	})
};

exports.getBungledInfo = function(callback) {
	var request = require('request');
	var tough = require('tough-cookie');
	var Cookie = tough.Cookie;
	var privateJar = request.jar();
	var _request = request.defaults({jar: privateJar});

	_this.getLoginInfo(function(options) {
		_request.post(options, function (err, httpResponse, body) {
			console.log(httpResponse.headers['set-cookie']);
			console.log(err);
			console.log(httpResponse.request.href);
			console.log(httpResponse.request.cookie);
			var aCookies = httpResponse.headers['set-cookie'];
			var BUNGLEATK, BUNGLEDID, BUNGLED;
			if (!aCookies){
				callback("Unexpected error: found nothing in set-cookie. Body text: " + body);
				return;
			}
			for (var cntr = 0; cntr < aCookies.length; cntr++) {
				var oCookie = Cookie.parse(aCookies[cntr]);
				if (oCookie.key == 'bungleatk') {
					console.log("bungleatk: " + oCookie.value);
					BUNGLEATK = oCookie.value;
				}
			}
			if(httpResponse.headers.cookie != undefined) {
				aCookies = httpResponse.request.headers.cookie.split(";").map(function (c) {
					return (Cookie.parse(c));
				});

				for (var cntr = 0; cntr < aCookies.length; cntr++) {
					var oCookie = aCookies[cntr];
					if (oCookie.key == 'bungled') {
						BUNGLED = oCookie.value;
					}
					else if (oCookie.key == 'bungledid') {
						BUNGLEDID = oCookie.value;
					}
				}
			}

			BUNGIE_COOKIE = "bungled=" + BUNGLED + "; bungledid=" + BUNGLEDID + "; bungleatk=" + BUNGLEATK;
			console.log(BUNGIE_COOKIE);
			callback(body);
		});
	});
};

exports.login = function(callback) {
	var request = require("request");

	var options = { 
		method: 'POST',
		url: 'https://login.live.com/ppsecure/post.srf',
		qs: { 
			client_id: '000000004013231D',
			scope: 'Xboxlive.signin%20Xboxlive.offline_access',
			' response_type': 'code',
			redirect_uri: 'https://www.bungie.net/en/User/SignIn/Xuid',
			display: 'touch',
			locale: 'en',
			contextid: 'E14DCA6 EC3B4A68D',
			bk: '1476373293',
			uaid: '4cc291af799340bab0d06c9e3a89f4da',
			pid: '15216' 
		},
		headers: { 'postman-token': '871fae35-9697-14a9-d459-2f4ce4113859', 'cache-control': 'no-cache' },
		body: '{login: \'baaronp7@gmail.com\',passwd: \'Acts2.38\',KMSI: 1,PPFT: \'DdDkXskEtVucf0*WLonDWXqpR8ewoawaG4Z62EcHmFvotFrxHyYj1xKKJGXNf5ZTas4MzroWQBsL3Fv4bF8ORjgDUxRFVZ11bOSZNObzb4uT3FX40OgTWz6DROdlELzMyXALsqUs94x5O5eiItn7XKDqus9w!9ur!m40D!BXKW6rvv0Lme3*T0xqlQwzj5YowpYvKJwOKk3inAmuMdkOewM$\'}',
		followAllRedirects: true
	};

	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		console.log("test");
		var re = /action\="(.*?)"/g;
		var result = re.exec(body);
		console.log(re.exec(body));
		callback(body);
	});
};

exports.changeItem = function(itemID, account, character, callback) {
	var options = {
		host: "login.live.com",
		path: "/oauth20_authorize.srf?client_id=000000004013231D&amp;scope=Xboxlive.signin%20Xboxlive.offline_access&amp;response_type=code&amp;redirect_uri=https://www.bungie.net/en/User/SignIn/Xuid&amp;display=touch&amp;locale=en"
	}

	var liveuser = "baaronp7@gmail.com";
	var livepass = "Acts2.38";
	var ppft;
	var urlPost;
	var exp_urlpost = /urlPost:\'(https:\/\/.*?)\'/g;
	var exp_ppft = /<input type="hidden" name="PPFT" id=".*" value="(.*?)"\/>/g;
	var message;
	var req = https.get(options, function(res){
		res.on('data', function(d) {
			console.log(d.toString());
			urlPost = exp_urlpost.exec(d);
			console.log(urlPost);
			ppft = exp_ppft.exec(d);
			console.log(ppft);
			message = d.toString();
	  }).on('end', function() {
			callback(message);
    });
	});

	req.end();

	req.on('error', function(e) {
	  console.log('ERROR: ' + e.message);
	});

	/*
	var opts = {
		host: "www.bungie.net",
		path: "/en/User/SignIn/Xuid",
		body: {'login': liveuser, 'passwd': livepass, 'PPFT': ppft}
	}

	var msg;

	var req2 = https.request(options, function(res){
		res.on('data', function(d) {
			cookies = res.headers["set-cookie"];
			console.log(cookies);
			console.log(d);
			console.log("test");
			msg = res;
	  }).on('end', function() {
			console.log("test");
			callback(msg);
    });
	});
	/*var options = {
	  host: host,
	  path: path+'EquipItem/',
	  headers: {'X-API-Key': "4c26e058e51742cc972a16cf20c6b6a3", 'x-csrf': xcsrf},
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

	req2.end();

	req2.on('error', function(e) {
	  console.log('ERROR: ' + e.message);
	});*/
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