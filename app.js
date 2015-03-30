
/**
 * Module dependencies.
 */

var express        = require('express');
var session        = require('cookie-session');
var favicon        = require('serve-favicon');
var bodyParser     = require('body-parser');
var morgan         = require('morgan');
var methodOverride = require('method-override');
var basicAuth      = require('basic-auth');
var passport       = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var http = require('http');
var path = require('path');

var ENV;
if (process.env.NODE_ENV) {
  ENV = process.env.NODE_ENV
} else {
  ENV = 'development';
}

// Config
var config = require('./config/config.json');

// MongoDB setup
var mongo = require('./config/mongo.json');
var mongoose  = require('mongoose');
var mongoUri = process.env.MONGOHQ_URL || mongo[ENV].uri;
var mongoOpts = mongo[ENV].opts;
mongoose.connect(mongoUri, mongoOpts);

// Auth setup
var auth = require('./config/auth.json')[ENV];
global.auth = auth;
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
passport.use(new GoogleStrategy({
    clientID: auth.google.client_id,
    clientSecret: auth.google.client_secret,
    callbackURL: auth.google.callback_url
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

var routes = require('./routes');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(morgan('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(session({keys: config.session_keys, secureProxy: false}))
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  if(auth.basic.enabled) {
    var credentials = basicAuth(req);
    if(!credentials || !(auth.basic.name === credentials.name &&
        auth.basic.pass === credentials.pass)) {
      res.writeHead(401, {
        'WWW-Authenticate': 'Basic realm="Welcome to Mongri"'
      });
      res.end();
    } else {
      next();
    }
  } else {
    next();
  }
});

app.use(function(req, res, next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.logoTitle = config.title;
  next();
});

// development only
if ('development' == app.get('env')) {
  mongoose.set('debug', true);
}

var collection = require('./routes/collection');
var document = require('./routes/document');

app.get('/', routes.index);
app.all('/collections*', ensureAuthenticated);
app.get('/collections', collection.collections);
app.get('/collections/:collection/drop', collection.dropCollection);
app.get('/collections/:document', document.documents);
app.get('/collections/:document/new', document.newDocument);
app.post('/collections/:document', document.postDocument);
app.get('/collections/:document/:id', document.document);
app.delete('/collections/:document/:id', document.deleteDocument);
app.post('/collections/:document/:id', document.documentUpdate);

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.email'] }),
  function(req, res){});
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    email = req.user.emails[0].value
    domain = email.split("@")[1]
    if (domain != auth.google.allow_domain){
      res.redirect('/logout');
    } else {
      res.redirect('/');
    }
  });
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (auth.google.enabled){
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }else{
    next();
  }
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
