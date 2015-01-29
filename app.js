var express         = require('express');
var mongoose        = require('mongoose');
var bodyParser      = require('body-parser');
var passport        = require('passport');
var path            = require('path');
var router          = require('./app/routes');
var User            = require('./app/models/user');

var app = express();

app.set('mongourl', process.env.MONGO_URL || 'mongodb://localhost:27017/ads');

mongoose.connect(app.get('mongourl'), function(err) {
  if (err) throw err;
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', router);

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, './public', 'index.html'));
});

module.exports = app;