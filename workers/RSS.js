var config = require("../config.js");
var feed = require("feed-read");
var async = require("async");
var mongoose = require("mongoose");

mongoose.connect(config.connection);
var modelRSS = mongoose.model("RSS");
var modelFilter = mongoose.model("Filter");
var modelFeed = mongoose.model("Feed");

var dayMS = 86400000;
var hourMS = 3600000;

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
    var type = data.type;
    self.getFilter({}, function (err, filter) {
      var filterVal = filter ? filter.val: null;
      self.getUrls({type:type}, function (err, data) {
        if(data && data.length > 0) {
          urls = [];
          for (var i = 0; i < data.length; i++) {
            urls.push(data[i].url);
          }
        }
        self.getFeeds(urls, function (err, feeds) {
          if(feeds) {
            var now = new Date();
            for (var i = 0; i < feeds[0].length; i++) {
              var list = feeds[0][i] || [];
              for (var j = 0; j < list.length; j++) {
                var feed = list[j];
                var tmpFeed = {
                  "type": type,
                  "href": feed.link,
                  "icon": "http://vendevor.com/img/features2/Website_Icon_Blue.png",
                  "title": feed.title,
                  "published": feed.published
                };
                var publishedDate = new Date(feed.published);
                self.saveFeeds(tmpFeed);
                if (filterVal && filterVal === 'hour') {
                  if((now - publishedDate) < hourMS) {
                    result.push(tmpFeed);
                  }
                } else if(filterVal && filterVal === 'day') {
                  if ((now - publishedDate) < dayMS) {
                    result.push(tmpFeed);
                  }
                }
              }
            }
            if (filterVal !== 'day' && filterVal !== 'hour') {
              result = [];
              self.getAllFeeds({type:type}, function (err, data) {
                var tmp;
                if(!err && data && data.length > 0) {
                  tmp = data.sort(self.sorByPublished);
                }
                result = result.concat(tmp);
                result.filter = filterVal;
                fn(result);
              });
            } else {
              result.filter = filterVal;
              fn(result);
            }
          }
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
  "getAllFeeds": function(data, fn) {
    var currentDate = new Date();
    var param = {
      type: data.type,
      published: {
        $gte: new Date(currentDate - dayMS),
        $lte: currentDate
      }
    };
    modelFeed.find(param).lean(true).exec(fn);
  },
  "saveFeeds": function (feed) {
    modelFeed.findOneAndUpdate({
      "type": feed.type,
      "href": feed.href
    }, feed, {
      upsert: true,
      new: true
    }, function (err, data) {});
  },
  "saveUrl": function(data, fn) {
    modelRSS.findOneAndUpdate({
      "href": data.url,
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
      upsert: true,
      new: true
    }, fn);
  },
  "getFilter": function(data, fn) {
    modelFilter.findOne({"type": "default"}, fn);
  },
  "updateNews": function (data, fn) {
    var result = [];
    var currentDate = data.last ? new Date(data.last): new Date();
    var param = {
      type: data.type,
      published: {
        $gte: new Date(currentDate - dayMS),
        $lte: currentDate
      }
    };
    modelFeed.find(param, function (err, data) {
      for (var i = 0; i < data.length; i++) {
        result.push({
          id: data[i].published,
          href: data[i].href,
          icon: data[i].icon,
          title: data[i].title
        });
      }
      fn(result);
    });
  },
  "sorByPublished": function(a ,b) {
    var dateA = new Date(a.published);
    var dateB = new Date(b.published);
    return dateA > dateB;
  },
};

module.exports = RSS;
