var _ = require('lodash');
var mongoose  = require('mongoose');

exports.collections = function(req, res){
  mongoose.connection.db.collectionNames(function(error, collectionNames) {
    if (error) {
      throw new Error(error);
    } else {
      collectionNames = _.reject(collectionNames, function(collectionName){
        return collectionName.name.match(/system\./);
      });
      var names = collectionNames.map(function(collectionName){
        return collectionName.name.replace(mongoose.connection.db.databaseName+".","");
      });
      res.render('collections', {
        title: 'Collections',
        db_name: mongoose.connection.db.databaseName,
        collections: names
      });
    }
  });
};
