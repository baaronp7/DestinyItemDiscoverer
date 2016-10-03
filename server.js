// server.js
// load the things we need
var express = require('express');
var partial = require('express-partial');
var less = require('less-middleware');
var app = express();

var destinyAPI = require('./destinyPlatformAPI');
var destinyNightBot = require('./destinyNightBot');

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(less(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));
app.use(partial());

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

  destinyNightBot.changeItem(item, account, character, function(message) {
      res.render('pages/json', {
        json: message
      });
  });
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
