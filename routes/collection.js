var _ = require('lodash');
var async = require('async');
var mongoose  = require('mongoose');

exports.collections = function(req, res){
  mongoose.connection.db.listCollections().toArray(function(error, collectionNames) {
    if (error) {
      throw new Error(error);
    } else {
      collectionNames = _.reject(collectionNames, function(collectionName){
        return collectionName.name.match(/system\./) || collectionName.name.match(/-system/);
      });
      var names = collectionNames.map(function(collectionName){
        return collectionName.name.replace(mongoose.connection.db.databaseName+".","");
      });
      counts = []
      async.eachSeries(names, function(n, cb) {
        mongoose.connection.db.collection(n).count({},function(err, count) {
          counts.push(count);
          cb();
        });
      }, function(err) {
        res.render('collections', {
          title: 'Collections',
          db_name: mongoose.connection.db.databaseName,
          collections: names,
          counts: counts
        });
      });
    }
  });
};

exports.dropCollection = function(req, res) {
  var collectionName = req.params.collection;
  var collection = mongoose.connection.db.collection(collectionName);
  collection.drop(function(err) {
    res.redirect("/collections");
  });
};
