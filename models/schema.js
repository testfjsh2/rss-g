var mongoose = require('mongoose');
var config = require('../config.js');

var Schema = mongoose.Schema;

var schRSS = new Schema({
  "url": String,
  "type": String
});

schRSS.index({
  "type": 1
}, {
  "sparse": true
});

var Filter = new Schema({
  "type": String,
  "val": String
});

Filter.index({
  "type": 1
}, {
  "sparse": true
});

mongoose.model('RSS', schRSS);
mongoose.model('Filter', Filter);