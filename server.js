// server.js
// load the things we need
var express = require('express');
var partial = require('express-partial');
var less = require('less-middleware');
var app = express();
passport = require('passport');

var destinyAPI = require('./destinyPlatformAPI');
var destinyNightBot = require('./destinyNightBot');

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
