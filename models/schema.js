var mongoose = require('mongoose');
var config = require('../config.js');

var Schema = mongoose.Schema;

var SchRSS = new Schema({
  "url": String,
  "type": String,
  "title": String,
  "checked": String,
  "icon": String
});

SchRSS.index({
  "type": 1,
  "checked": 1
}, {
  "sparse": true
});

SchRSS.index({
  "type": 1,
  "url": 1
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

var Feed = new Schema({
  "type": String,
  "href": String,
  "url": String,
  "icon": String,
  "title": String,
  "published": Date
});

Feed.index({
  "type": 1
}, {
  "sparse": true
});

Feed.index({
  "type": 1,
  "url": 1
}, {
  "sparse": true
});

Feed.index({
  "type": 1,
  "url": 1,
  "published": 1
}, {
  "sparse": true
});

Feed.index({
  "type": 1,
  "published": 1
}, {
  "sparse": true
});

Feed.index({
  "type": 1,
  "href": 1
}, {
  "sparse": true
});

mongoose.model('RSS', SchRSS);
mongoose.model('Filter', Filter);
mongoose.model('Feed', Feed);