var mongoose = require('mongoose');
var vm = require('vm');
var json = require('./json');


exports.getSandbox = function() {
  return {
    ObjectId: mongoose.Types.ObjectId,
    ISODate: Date,
    Date: Date
  };
};

exports.toBSON = function(string) {
  var sandbox = exports.getSandbox();

  string = string.replace(/ISODate\(/g, "new ISODate(");

  vm.runInNewContext('doc = eval((' + string + '));', sandbox);

  return sandbox.doc;
};

exports.toString = function(doc) {
  return json.stringify(doc, null, '    ');
};
