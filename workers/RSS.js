var config = require("../config.js");
var feed = require("feed-read");
var async = require("async");
var mongoose = require("mongoose");

mongoose.connect(config.connection);
var modelRSS = mongoose.model("RSS");
var modelFilter = mongoose.model("Filter");
var modelFeed = mongoose.model("Filter");

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
            var dayMS = 86400000;
            var hourMS = 3600000;
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
                } else {
                  self.getAllFeeds({type:type}, function (err, data) {
                    if(!err && data && data.length > 0) {
                      result = data.sort(self.sorByPublished);
                    }
                    fn(result);
                  });
                }
              }
            }
            if (filterVal === 'day' || filterVal === 'hour') {
              fn(result);
            }
          } else {
            fn(result);
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
    modelFeed.find({"type": data.type}, fn);
  },
  "saveFeeds": function (feed) {
    modelFeed.findOneAndUpdate({
      "type": feed.type,
      "href": feed.href
    }, feed, {
      upsert: true,
      new: true
    });
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
    for (var i = data.last; i < (data.last + 10); i++) {
      result.push({
        id: i,
        posted_at: '23.01.2016 04:53:45',
        comments_count: 42,
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean accumsan aliquet lectus. Duis quam. Nullam aliquam. In eu orci sed velit ullamcorper ultrices. Proin ac lorem vitae orci fringilla rhoncus. Maecenas cursus dapibus quam. Maecenas mattis condimentum mauris. Vestibulum eu est. Quisque lorem. Suspendisse arcu lectus, sagittis at, porttitor quis, porta sed, eros. Donec bibendum magna quis mauris.'
      });
    }

    fn(result);
  },
  "sorByPublished": function(a ,b) {
    var dateA = new Date(a.published);
    var dateB = new Date(b.published);
    return dateA > dateB;
  },
};

module.exports = RSS;
