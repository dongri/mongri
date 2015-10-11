var _ = require('lodash');
var mongoose  = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var bson = require('../lib/bson');

exports.documents = function(req, res) {
  var document = req.params.document;
  var query    = req.query.query;
  var sort     = req.query.sort;
  var skip     = req.query.skip;
  var limit    = req.query.limit;
  if (!query){
    query='';
  } else {
    var token = query.split(":");
    if (token[0] == "_id"){
      if (!token[1].match(/ObjectId/)) {
        value = "ObjectId("+token[1]+")";
        query = "_id:" + value;
      }
    }
  }
  if (!sort){
    sort = "_id:-1";
  }
  if (!skip){
    skip = 0;
  }
  if (!limit){
    limit = 10;
  }
  sort = bson.toBSON("{"+sort+"}");
  query = bson.toBSON("{"+query+"}");
  col = mongoose.connection.db.collection(document);
  col.find({}).count(function(err, count){
    col.find(query, {skip:skip, limit:limit}).sort(sort).toArray(function(err, docs) {
      ids = _.map(docs, function(d){
        return d._id;
      });
      docs = _.map(docs, function(d){
        return bson.toString(d)
      });
      var hasNext = false;
      if (count > 10){
        hasNext = true;
      }
      var hasPrevious = false;
      if (skip != 0){
        hasPrevious = true;
      }
      res.render('documents', {
        title: document,
        db_name: mongoose.connection.db.databaseName,
        document: document,
        docs: docs,
        ids: ids,
        hasNext: hasNext,
        hasPrevious: hasPrevious
      });
    });
  });
};

exports.newDocument = function(req, res) {
  var document = req.params.document;
  var id = mongoose.Types.ObjectId();
  res.render('new_document', {
    title: document,
    db_name: mongoose.connection.db.databaseName,
    doc: bson.toString({_id:id}),
    document: document
  });
};

exports.postDocument = function(req, res) {
  var document = req.params.document;
  var doc = req.body.doc;
  var col = mongoose.connection.db.collection(document);
  try {
    docBSON = bson.toBSON(doc);
  } catch (err) {
    throw new Error(error);
  }
  col.insert(docBSON, function(err, result) {
    if (err) {
      throw new Error(err);
    } else {
      doc = result.ops[0];
      return res.redirect('/collections/'+document+'/'+doc._id)
    }
  });
};

exports.deleteDocument = function(req, res) {
  var document = req.params.document;
  var id = req.params.id;
  var col = mongoose.connection.db.collection(document);
  col.findAndModify({_id:ObjectId(id)}, [], null, {remove: true}, function(err, doc){
    if (err) {
      throw new Error(error);
    } else {
      res.redirect('/collections/'+document);
    }
  });
};

exports.document = function(req, res) {
  var document = req.params.document;
  var id = req.params.id;
  var col = mongoose.connection.db.collection(document);
  col.findOne({_id:ObjectId(id)}, function(err, doc) {
    if (err) {
      throw new Error(err);
    } else {
      res.render('document', {
        title: document,
        db_name: mongoose.connection.db.databaseName,
        document: document,
        doc: bson.toString(doc),
        document_id: id
      });
    }
  });
};

exports.documentUpdate = function(req, res) {
  var document = req.params.document;
  var id = req.params.id;
  var doc = req.body.doc;
  var col = mongoose.connection.db.collection(document);
  try {
    docBSON = bson.toBSON(doc);
  } catch (err) {
    throw new Error(err);
  }
  col.findAndModify({_id:ObjectId(id)}, [], docBSON, {new: true, upsert:true}, function(err, updatedDoc) {
    if (err) {
      throw new Error(err);
    } else {
      res.render('document', {
        title: document,
        db_name: mongoose.connection.db.databaseName,
        document: document,
        doc: doc,
        document_id: id
      });
    }
  });
};
