// server.js
// load the things we need
var express = require('express');
var partial = require('express-partial');
var less = require('less-middleware');
var passport = require("passport");
var app = express();

var destinyAPI = require('./destinyPlatformAPI');
var destinyNightBot = require('./destinyNightBot');

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(less(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));
app.use(partial());
app.use(passport.initialize());
app.use(passport.session());

var WindowsLiveStrategy = require('passport-windowslive').Strategy;

passport.use('windowslive', new WindowsLiveStrategy({
    clientID: "766bea47-a9e7-4692-8d9c-5f2e92e60f49",
    clientSecret: "F5vNFrbMResFNio95qziszs",
    callbackURL: "https://www.bungie.net/en/User/SignIn/Xuid"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ windowsliveId: profile.id }, function (err, user) {
      console.log("test");
      return cb(err, user);
    });
  }
));

app.get('/auth/windows', passport.authenticate('windowslive', function() {console.log("test")}), function(req, res) {
  console.log(res.headers['set-cookie']);
  res.redirect(req.session.returnTo || '/');
    delete req.session.returnTo;
});

app.get('/auth/windows/callback', passport.authenticate('windowslive', {
  successRedirect: '/success',
  failureRedirect: '/error'
}));

app.get('/success', function(req, res, next) {
  console.log(res.headers['set-cookie']);
  console.log("test");
  res.send('Successfully logged in.');
});

app.get('/error', function(req, res, next) {
  console.log(res.headers['set-cookie']);
  console.log("test");
  res.send("Error logging in.");
});

app.get('/login', function (req, res) {
  var phantom = require('phantom');

  phantom.create(function(ph){
    ph.createPage(function(page) {
      page.open("http://localhost:3000/auth/windows", function(status) {
          console.log("Status: " + status);
          if(status === "success") {
            console.log(res.headers['set-cookie']);
            console.log("test2");
          }
          ph.exit();
      })
    })
  });
});

app.get('/', function (req, res) {
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

app.get('/stream', function (req, res) {
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
    destinyNightBot.getCharacter(account, getCharacter, function(json) {
      
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
    destinyNightBot.getCharacter(account, getCharacter, function(json) {
      
      //get the characters items
      destinyNightBot.getStats (memType, account, getCharacter, mode, function(stats){
        res.render('pages/stats', {
          characterBase: JSON.parse(json).Response.data.characterBase,
          stats: stats,
          games: games
        });
      });
    });
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

  destinyNightBot.getCookie(function(message) {
      res.render('pages/json', {
        json: message
      });
  });
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
