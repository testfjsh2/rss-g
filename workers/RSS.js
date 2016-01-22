var config = require("../config.js");
var feed = require("feed-read");
var async = require("async");
var mongoose = require("mongoose");

mongoose.connect(config.connection);
var modelRSS = mongoose.model("RSS");
var modelFilter = mongoose.model("Filter");

var RSS = {
  // return:
  //   * "title"     - The article title (String).
  //   * "href"      - The original article link (String).
  //   * "published" - The date that the article was published (Date).
  //   * "icon"      - site icon
  "get": function(data, fn) {
    var self = this;
    var result = [];
    var urls = [config.defaultUrl];
    self.getFilter({}, function (err, filter) {
      var filterVal = filter ? filter.val: null;
      self.getUrls(data, function (err, data) {
        if(data.length > 0) urls = [];
        for (var i = 0; i < data.length; i++) {
          urls.push(data[i].url);
        };
        self.getFeeds(urls, function (err, feeds) {
          if(feeds)
            var now = new Date();
            var dayMS = 86400000;
            var hourMS = 3600000;
            for (var i = 0; i < feeds[0].length; i++) {
              var list = feeds[0][i];
              for (var j = 0; j < list.length; j++) {
                var feed = list[j];
                var tmpFeed = {
                  "href": feed.link,
                  "icon": "http://vendevor.com/img/features2/Website_Icon_Blue.png",
                  "title": feed.title,
                  "published": feed.published
                };
                var publishedDate = new Date(feed.published);
                if (filterVal && filterVal === 'hour') {
                  if((now - publishedDate) < hourMS) {
                    result.push(tmpFeed);
                  }
                } else if(filterVal && filterVal === 'day') {
                  if ((now - publishedDate) < dayMS) {
                    result.push(tmpFeed);
                  }
                } else {
                  result.push(tmpFeed);
                }
              }
            }
          fn(result);
        })
      });
    });
  },

  // return:
  //   * "title"     - The article title (String).
  //   * "author"    - The author"s name (String).
  //   * "link"      - The original article link (String).
  //   * "content"   - The HTML content of the article (String).
  //   * "published" - The date that the article was published (Date).
  //   * "feed"      - {name, source, link}
  "getFeeds": function(data, fn) {
    var self = this;
    var result = [];
    var funcs = [];
    for (var i = 0; i < data.length; i++) {
      funcs.push(function (callback) {
        feed(data.pop(), function (err, articles) {
          result.push(articles);
          callback(err, result);
        });
      })
    };
    async.parallel(funcs, fn);
  },
  "saveUrl": function(data, fn) {
    modelRSS.findOneAndUpdate({
      "url": data.url,
      "type": data.type
    }, data, {
      upsert: true,
      new: true
    }, fn);
  },
  "getUrls": function(data, fn) {
    modelRSS.find({"type": data.type}, fn);
  },
  "saveFilter": function(data, fn) {
    modelFilter.findOneAndUpdate({
      "type": "default",
    }, {
      "type": "default",
      "val": data.val
    }, {
      "upsert": true,
      "new": true
    }, fn);
  },
  "getFilter": function(data, fn) {
    modelFilter.findOne({"type": "default"}, fn);
  }
};

module.exports = RSS;
