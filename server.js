// server.js
// load the things we need
var express = require('express');
var partial = require('express-partial');
var less = require('less-middleware');
var app = express();

var destinyAPI = require('./destinyPlatformAPI');
// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(less(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));
app.use(partial());

app.get('/', function (req, res) {
  var page = req.query.page;
  if(page == undefined)
    page = 0
  destinyAPI.getItems(page, function(itemsJSON) {
    res.render('pages/items', {
      cssFiles: ['/css/home.css'],
      itemsJSON: itemsJSON
    });
  });
});

app.get('/getItem', function (req, res) {
  destinyAPI.getItem(req.query.iId, function(accountJSON) {
    res.render('pages/account', {
      accountJSON: accountJSON
    });
  });
});

app.get('/account', function (req, res) {
  destinyAPI.getAccount(req.query.memType, req.query.memId, function(accountJSON) {
    res.render('pages/account', {
      accountJSON: accountJSON
    });
  });
});

app.get('/character', function (req, res) {
  destinyAPI.getCharacter( function(accountJSON) {
    res.render('pages/account', {
      accountJSON: accountJSON
    });
  });
});

app.get('/search', function (req, res) {
  destinyAPI.searchPlayer(req.query.memType, req.query.player, function(accountJSON) {
    res.render('pages/account', {
      accountJSON: accountJSON
    });
  });
});

app.listen(8080);
console.log('8080 is the magic port');
