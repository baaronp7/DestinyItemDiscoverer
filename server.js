// server.js
// load the things we need
var express = require('express');
var partial = require('express-partial');
var less = require('less-middleware');
var app = express();
passport = require('passport');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var destinyAPI = require('./destinyPlatformAPI');
var destinyNightBot = require('./destinyNightBot');

var mongurl = 'mongodb://baaronp7:Acts2.38@ds053778.mlab.com:53778/heroku_pw18gq42';
var mongoJSON;
var weaponsListJSON;
var findWeapons = function(db, callback) {
  // Get the weapons collection 
  var collection = db.collection('weapons');
  // Find some documents 
  collection.find({}).toArray(function(err, items) {
    assert.equal(null, err);
    assert.equal(180, items.length);
    console.log("Found the following records");
    callback(items);
  });
}

var insertWeaponsList = function(db, callback) {
  db.collection('weaponsList').insertOne(weaponsListJSON, function(err, result) {
    assert.equal(err, null);
    console.log("Updated Weapons List.");
    callback();
  });
}

var buildWeaponList = function(){
  var jsonStrs = {"0":[{id: 0, type: 0, name: "Auto Rifle", json: "[", count: 0},{id: 1, type: 0, name: "Hand Cannon", json: "[", count: 0},{id: 2, type: 0, name: "Pulse Rifle", json: "[", count: 0},{id: 3, type: 0, name: "Scout Rifle", json: "[", count: 0}],"1":[{id: 4, type: 1, name: "Fusion Rifle", json: "[", count: 0},{id: 5, type: 1, name: "Shotgun", json: "[", count: 0},{id: 6, type: 1, name: "Sniper Rifle", json: "[", count: 0}],"2":[{id: 7, type: 2, name: "Machine Gun", json: "[", count: 0},{id: 8, type: 2, name: "Rocket Launcher", json: "[", count: 0}]};
  for(var item in mongoJSON){
    var i;
    var j;
    if(mongoJSON[item].Type == jsonStrs[0][0].name) {
      i = 0;
      j = 0;
    }
    else if(mongoJSON[item].Type == jsonStrs[0][1].name) {
      i = 0;
      j = 1;
    }
    else if(mongoJSON[item].Type == jsonStrs[0][2].name) {
      i = 0;
      j = 2;
    }
    else if(mongoJSON[item].Type == jsonStrs[0][3].name) {
      i = 0;
      j = 3;
    }
    else if(mongoJSON[item].Type == jsonStrs[1][0].name) {
      i = 1;
      j = 0;
    }
    else if(mongoJSON[item].Type == jsonStrs[1][1].name) {
      i = 1;
      j = 1;
    }
    else if(mongoJSON[item].Type == jsonStrs[1][2].name) {
      i = 1;
      j = 2;
    }
    else if(mongoJSON[item].Type == jsonStrs[2][0].name) {
      i = 2;
      j = 0;
    }
    else {
      i = 2;
      j = 1;
    }
    var json = jsonStrs[i][j].json;
    var count = jsonStrs[i][j].count;
    json = json+'{'+
    '"id":'+count+','+
    '"name":"'+mongoJSON[item].Name+'",'+
    '"light":"'+mongoJSON[item].Light+'",'+
    '"dmg":"'+mongoJSON[item].Dmg+'",';
    var perks = "";
    var node = mongoJSON[item].Nodes;
    if(node.slice(-1) == "*")
      perks = perks + node.substring(0, node.length-1) + ", ";
    id = 21;
    while(mongoJSON[item]["field"+id] !== "") {
      var field = mongoJSON[item]["field"+id];
      if(field.slice(-1) == "*")
        perks = perks + field.substring(0, field.length-1) + ", ";
      id++;
    }
    perks = perks.substring(0, perks.length-2);
    json = json+'"perks":"'+perks+'",'+
    '"votes":0'+
    '},';
    jsonStrs[i][j].count = count + 1;
    jsonStrs[i][j].json = json;
  }
  for(var i in jsonStrs) {
    for(var j in jsonStrs[i]) {
      jsonStrs[i][j].json = jsonStrs[i][j].json.substring(0, jsonStrs[i][j].json.length-1);
      jsonStrs[i][j].json = jsonStrs[i][j].json+"]";
      jsonStrs[i][j].json = JSON.parse(jsonStrs[i][j].json);
    }
  }
  weaponsListJSON = jsonStrs;
}

var weaponListVote = function(type, wclass, id, callback) {
  //make this function update the weaponList in db
  try {
    var weapon = weaponsListJSON[type][wclass].json[id];
    weapon.votes = weapon.votes + 1;
    weaponsListJSON[type][wclass].json[id] = weapon;
    console.log(weapon);
    callback("Weapon Voted For");
  }
  catch(err) {
    var weapon = weaponsListJSON[type][wclass].json[id];
    callback("Could Not Find Weapons");
  }
}

MongoClient.connect(mongurl, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
 
  findWeapons(db, function(items) {
    console.log("Added items to mongoJSON");
    mongoJSON = items;
    buildWeaponList();
    insertWeaponsList(db, function() {
      db.close();
    });
  });
});

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(less(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));
app.use(partial());

var TwitchtvStrategy = require('passport-twitchtv').Strategy;
var TWITCH_CLIENT_ID = "356183dj0szhj1di32a4td2rcqs40qp";
var TWITCH_CLIENT_SECRET = "nxrqetanmjnlinvpv5pzulm7mrwuo62";

passport.use(new TwitchtvStrategy({
    clientID: TWITCH_CLIENT_ID,
    clientSecret: TWITCH_CLIENT_SECRET,
    callbackURL: "http://www.destinyid.com/auth/twitchtv/callback",
    scope: "channel_subscriptions"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ twitchtvId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.get('/auth/twitchtv', passport.authenticate('twitchtv'));

app.get('/auth/twitchtv/callback', 
  passport.authenticate('twitchtv', { failureRedirect: '/login' }),
  function(req, res) {
    console.log("TEST2");
    if (err) {console.log("TEST"); return next(err); }
    // Successful authentication, redirect home.
    console.log("TEST2");
    console.log(req.query.code);
    res.redirect('/');
  }
);

app.get('/mongo/weaponsData', function (req, res) {
  res.render('pages/json', {
      json: JSON.stringify(mongoJSON)
  });
});

app.get('/mongo/weaponsList', function (req, res) {
  buildWeaponList();
  res.render('pages/json', {
    json: JSON.stringify(weaponsListJSON)
  });
});

app.get('/mongo/weaponsList/vote', function (req, res) {
  var tid = req.query.tid;
  var wclass = req.query.wclass;
  var wid = req.query.wid;
  var resMsg;
  weaponListVote(tid, wclass, wid, function(msg){ resMsg=msg; });
  res.render('pages/json', {
    json: resMsg
  });
});

app.get('/home', function (req, res) {
  var categories = req.query.categories;
  var rarity = req.query.rarity;
  var page = req.query.page;
  if(page == undefined)
    page = 0;
  destinyAPI.getItems(categories, rarity, page, function(itemsJSON) {
    var numPages = parseInt(itemsJSON.Response.data.totalResults) / parseInt(itemsJSON.Response.data.query.itemsPerPage)
    res.render('pages/items', {
      cssFiles: ['/css/home.css'],
      itemsJSON: itemsJSON,
      numPages: numPages
    });
  });
});

app.get('/getItem', function (req, res) {
  destinyAPI.getItem(req.query.iId, function(json) {
    res.render('pages/json', {
      json: json
    });
  });
});

app.get('/account', function (req, res) {
  destinyAPI.getAccount(req.query.memType, req.query.memId, function(accountJSON) {
    res.render('pages/account', {
      cssFiles: ['/css/account.css'],
      accountJSON: accountJSON
    });
  });
});

app.get('/character', function (req, res) {
  destinyAPI.getCharacter( function(json) {
    res.render('pages/json', {
      json: json
    });
  });
});

app.get('/search', function (req, res) {
  destinyAPI.searchPlayer(req.query.memType, req.query.player, function(searchJSON) {
    res.render('pages/search', {
      searchJSON: searchJSON
    });
  });
});

app.get('/music', function (req, res) {
  res.render('pages/music', {
    cssFiles: ['/css/music.css'],
    player: req.query.player,
    uri: req.query.uri
  });
});

app.get('/', function (req, res) {
   res.render('pages/api', {
    cssFiles: ['/css/api.css']
  });
});

app.get('/stream/viewers', function (req, res) {
  var twitchAccount = req.query.twitchAccount;
  if(twitchAccount == undefined)
    twitchAccount = "akabennyp";

  var styles = {bgColor: "#121C1E", color: "#f3f3f3"}
  if(req.query.bgColor != null) {
    styles.bgColor = req.query.bgColor;
  }

  if(req.query.color != null) {
    styles.color = req.query.color;
  }

  destinyNightBot.getViewers(twitchAccount, function(currentViewers) {
    if(JSON.parse(currentViewers).streams[0] == undefined){
      res.render('pages/twitchData', {
        cssFiles: ['/css/twitchData.css'],
        text: "Current Viewers:",
        data: "0",
        styles: styles
      });
    } else {
      res.render('pages/twitchData', {
        cssFiles: ['/css/twitchData.css'],
        text: "Current Viewers:",
        data: JSON.parse(currentViewers).streams[0].viewers,
        styles: styles
      });
    }
  });
});

app.get('/stream/followers', function (req, res) {
  var twitchAccount = req.query.twitchAccount;
  if(twitchAccount == undefined)
    twitchAccount = "akabennyp";

  var styles = {bgColor: "#121C1E", color: "#f3f3f3"}
  if(req.query.bgColor != null) {
    styles.bgColor = req.query.bgColor;
  }

  if(req.query.color != null) {
    styles.color = req.query.color;
  }

  destinyNightBot.getFollowers(twitchAccount, function(followers) {
    res.render('pages/twitchData', {
      cssFiles: ['/css/twitchData.css'],
      text: "Follower Count:",
      data: JSON.parse(followers)._total,
      styles: styles
    });
  });
});

app.get('/stream/lastFollower', function (req, res) {
  var twitchAccount = req.query.twitchAccount;
  if(twitchAccount == undefined)
    twitchAccount = "akabennyp";

  var styles = {bgColor: "#121C1E", color: "#f3f3f3"}
  if(req.query.bgColor != null) {
    styles.bgColor = req.query.bgColor;
  }

  if(req.query.color != null) {
    styles.color = req.query.color;
  }

  destinyNightBot.getLastFollower(twitchAccount, function(lastFollower) {
    res.render('pages/twitchData', {
      cssFiles: ['/css/twitchData.css'],
      text: "Last Follower:",
      data: JSON.parse(lastFollower).follows[0].user.display_name,
      styles: styles
    });
  });
});

app.get('/stream/subscriptions', function (req, res) {
  var twitchAccount = req.query.twitchAccount;
  if(twitchAccount == undefined)
    twitchAccount = "akabennyp";

  var styles = {bgColor: "#121C1E", color: "#f3f3f3"}
  if(req.query.bgColor != null) {
    styles.bgColor = req.query.bgColor;
  }

  if(req.query.color != null) {
    styles.color = req.query.color;
  }

  destinyNightBot.getSubscriptions(twitchAccount, function(subscriptions) {
    res.render('pages/twitchData', {
      cssFiles: ['/css/twitchData.css'],
      text: "Sub Count:",
      data: JSON.parse(subscriptions)._total,
      subscriptions: subscriptions,
      styles: styles
    });
  });
});

app.get('/stream/stat', function (req, res) {
  var memType = req.query.memType;
  if(memType == undefined)
    memType = "1";

  var account = req.query.account;
  if(account == undefined)
    account = "4611686018429670931";

  var character = req.query.character;

  var type = req.query.type;
  if(type == undefined)
    type = "ALL";

  destinyNightBot.getAccount(memType, account, function(accountJSON) {
    var getCharacter = null;

    //Get last played character or character passed in url
    destinyNightBot.character(character, accountJSON, function(c){
      getCharacter = c;
    });
    
    //get character json
    destinyNightBot.getCharacter(memType, account, getCharacter, function(json) {
      
      //get the characters items
      destinyNightBot.items(json, function(items){
        res.render('pages/character', {
          type: type,
          characterBase: JSON.parse(json).Response.data.characterBase,
          items: items
        });
      });
    });
  });
});

app.get('/stream/stats', function (req, res) {
  var memType = req.query.memType;
  if(memType == undefined)
    memType = "1";

  var account = req.query.account;
  if(account == undefined)
    account = "4611686018429670931";

  var character = req.query.character;

  var mode = req.query.mode;
  if(mode == undefined)
    mode = "IronBanner";

  var games = req.query.games;
  if(games == undefined)
    games = 5;

  destinyNightBot.getAccount(memType, account, function(accountJSON) {
    var getCharacter = null;

    //Get last played character or character passed in url
    destinyNightBot.character(character, accountJSON, function(c){
      getCharacter = c;
    });
    
    //get character json
    destinyNightBot.getCharacter(memType, account, getCharacter, function(json) {
      
      //get the characters items
      destinyNightBot.getStatsHistory(memType, account, getCharacter, mode, games, function(stats){
        res.render('pages/stats', {
          characterBase: JSON.parse(json).Response.data.characterBase,
          stats: stats,
          games: games,
          mode: mode
        });
      });
    });
  });
});

app.get('/stream/stats/aggregate', function (req, res) {
  var memType = req.query.memType;
  if(memType == undefined)
    memType = "1";

  var account = req.query.account;
  if(account == undefined)
    account = "4611686018429670931";

  var character = req.query.character;
  
  var mode = req.query.mode;
  if(mode == undefined)
    mode = "TrialsOfOsiris";

  var styles = {bgColor: "#121C1E", color: "#f3f3f3"}
  if(req.query.bgColor != null) {
    styles.bgColor = req.query.bgColor;
  }

  if(req.query.color != null) {
    styles.color = req.query.color;
  }

  destinyNightBot.getAccount(memType, account, function(accountJSON) {
    var getCharacter = null;

    //Get last played character or character passed in url
    destinyNightBot.character(character, accountJSON, function(c){
      getCharacter = c;
    });
    
    //get character json
    destinyNightBot.getCharacter(memType, account, getCharacter, function(json) {
      
      if(mode !== "Raid") {
        destinyNightBot.getStats(memType, account, getCharacter, mode, function(stats){
          res.render('pages/pvp', {
            cssFiles: ['/css/pvp.css'],
            characterBase: JSON.parse(json).Response.data.characterBase,
            stats: stats,
            mode: mode,
            styles: styles
          });
        });
      } else {
        var raid = req.query.raid;
        if(raid == undefined)
          raid = "roi";
        var difficulty = req.query.difficulty;
        if(difficulty == undefined)
          difficulty = "heroic";
        destinyNightBot.getStatsHistory(memType, account, getCharacter, mode, 100, function(stats){
          destinyNightBot.getRaidHistory(stats, raid, difficulty, function(raidStats) {
            res.render('pages/raid', {
              cssFiles: ['/css/raid.css'],
              characterBase: JSON.parse(json).Response.data.characterBase,
              stats: raidStats,
              raid: raid,
              difficulty: difficulty,
              mode: mode,
              styles: styles
            });
          });
        });
      }
    });
  });
});

app.get('/stream/stats/weapons', function (req, res) {
  var memType = req.query.memType;
  if(memType == undefined)
    memType = "1";

  var account = req.query.account;
  if(account == undefined)
    account = "4611686018429670931";

  var character = req.query.character;

  var type = req.query.type;
  if(type == undefined)
    type = "ALL";
  
  var styles = {bgColor: "#121C1E", color: "#f3f3f3"}
  if(req.query.bgColor != null) {
    styles.bgColor = req.query.bgColor;
  }

  if(req.query.color != null) {
    styles.color = req.query.color;
  }


  destinyNightBot.getAccount(memType, account, function(accountJSON) {
    var getCharacter = null;

    //Get last played character or character passed in url
    destinyNightBot.character(character, accountJSON, function(c){
      getCharacter = c;
    });
    
    //get character json
    destinyNightBot.getCharacter(memType, account, getCharacter, function(json) {
      
      //get the characters items
      destinyNightBot.items(json, function(items){
        res.render('pages/weapons', {
          cssFiles: ['/css/weapons.css'],
          type: type,
          characterBase: JSON.parse(json).Response.data.characterBase,
          items: items,
          styles: styles
        });
      });
    });
  });
});

app.get('/stream/song', function (req, res) {
  var url = req.query.url;
  if(req.query.url == null) {
    var url = 'https://www.dropbox.com/s/iuznboreomuddbf/Snip.txt';
  }
  
  destinyNightBot.getSong(url, function(message){
    res.render('pages/json', {
        json: message
      });
  });
});

app.get('/stream/songDisplay', function (req, res) {
  var url = req.query.url;
  if(req.query.url == null) {
    var url = 'https://www.dropbox.com/s/iuznboreomuddbf/Snip.txt';
  }

  var img = req.query.img;
  if(req.query.img == null) {
    var img = 'https://www.dropbox.com/s/x1kqmfwbhvjmdh6/Snip_Artwork.jpg?raw=1';
  }
  res.render('pages/song', {
    cssFiles: ['/css/song.css'],
    song: url,
    songIMG: img
  });
});

app.get('/stream/changeItem', function (req, res) {
  var item = req.query.item;
  if(item == undefined)
    item = "6917529098455518207";

  var account = req.query.account;
  if(account == undefined)
    account = "4611686018429670931";

  var character = req.query.character;
  if(character == undefined)
    character = "2305843009219801924";
  
  destinyNightBot.login(function(message){
    res.render('pages/json', {
        json: message
      });
  });
  /*
  destinyNightBot.changeItem(item, account, character, function(message) {
      res.render('pages/json', {
        json: message
      });
  });*/
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
