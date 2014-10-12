
/**
 * Module dependencies.
 */

var express        = require('express');
var favicon        = require('serve-favicon');
var bodyParser     = require('body-parser');
var morgan         = require('morgan');
var methodOverride = require('method-override');

var routes = require('./routes');
var http = require('http');
var path = require('path');

var ENV;
if (process.env.NODE_ENV) {
  ENV = process.env.NODE_ENV
} else {
  ENV = 'development';
}

// MongoDB setup
var mongo = require('./config/mongo.json');
var mongoose  = require('mongoose');
var mongoUri = process.env.MONGOHQ_URL || mongo[ENV].uri;
var mongoOpts = mongo[ENV].opts;
mongoose.connect(mongoUri, mongoOpts);

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(morgan('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  mongoose.set('debug', true);
}

var collection = require('./routes/collection');
var document = require('./routes/document');

app.get('/', routes.index);
app.get('/collections', collection.collections);
app.get('/collections/:collection/drop', collection.dropCollection);
app.get('/collections/:document', document.documents);
app.get('/collections/:document/new', document.newDocument);
app.post('/collections/:document', document.postDocument);
app.get('/collections/:document/:id', document.document);
app.delete('/collections/:document/:id', document.deleteDocument);
app.post('/collections/:document/:id', document.documentUpdate);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
