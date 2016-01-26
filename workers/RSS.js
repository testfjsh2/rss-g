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
    var type = data.type;
    var result = {
      news: [],
      urls: [],
      iconDictionary: {},
      urlList: [],
      type: type,
      filter: ''
    };
    self.getFilter({}, function (err, filter) {
      var filterVal = filter ? filter.val: null;
      self.getUrls({type:type}, function (err, urls) {
        var urlList = [];
        if(urls && (urls.length > 0)) {
          for (var i = 0; i < urls.length; i++) {
            result.urls.push({
              type: urls[i].type,
              url: urls[i].url,
              title: urls[i].title || 'Выбрать источник',
              checked: urls[i].checked,
              icon: urls[i].icon || config.defaultIcon
            });
            result.iconDictionary[urls[i].url] = urls[i].icon || config.defaultIcon;
            if (urls[i].checked !== "unchecked") {
              result.urlList.push(urls[i].url);
              urlList.push(urls[i].url);
            }
          }
        }
        if (urlList.length === 0) {
          result.urlList.push(config.defaultUrl);
          urlList.push(config.defaultUrl);
        }
        self.getFeeds(urlList, function (err, feeds) {
          if(feeds && (feeds.length > 0)) {
            var now = new Date();
            for (var i = 0; i < feeds[0].length; i++) {
              var list = feeds[0][i] || [];
              for (var j = 0; j < list.length; j++) {
                var feed = list[j];
                var tmpFeed = {
                  "type": type,
                  "href": feed.link,
                  "url": feed.feed.source,
                  "icon": result.iconDictionary[feed.feed.source] || config.defaultIcon,
                  "title": feed.title,
                  "published": feed.published
                };
                var publishedDate = new Date(feed.published);
                self.saveFeeds(tmpFeed);
                if (~result.urlList.indexOf(feed.feed.source)) {
                  if (filterVal && filterVal === 'hour') {
                    if((now - publishedDate) < hourMS) {
                      result.news.push(tmpFeed);
                    }
                  } else if(filterVal && filterVal === 'day') {
                    if ((now - publishedDate) < dayMS) {
                      result.news.push(tmpFeed);
                    }
                  }
                }
              }
            }
            if (filterVal !== 'day' && filterVal !== 'hour') {
              self.getAllFeeds({type:type, urlList: result.urlList}, function (err, data) {
                var tmp;
                if(!err && data && data.length > 0) {
                  tmp = data.sort(self.sortByPublished);
                }
                result.news = result.news.concat(tmp);
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
      url: {
        $in: data.urlList
      },
      published: {
        $gt: new Date(currentDate - (2*dayMS)),
        $lt: currentDate
      }
    };
    modelFeed.find(param).sort({"published": -1}).lean(true).exec(fn);
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
      "checked": "checked",
      "title": data.title,
      "icon": date.icon,
      "type": data.type
    }, data, {
      upsert: true,
      new: true
    }, fn);
  },
  "getUrls": function(data, fn) {
    modelRSS.find({"type": data.type}).lean(true).exec(fn);
  },
  "checkUrl": function (data, fn) {
    modelRSS.findOne({
      "type": data.type,
      "url": data.url
    }, function (err, url) {
      if (data.state) {
        url.checked = data.state;
      }else if (url.checked === 'unchecked') {
        url.checked = 'checked';
      } else {
        url.checked = 'unchecked';
      }
      url.save(fn);
    });
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
    var urls = (data.urls && (data.urls.length > 0)) ? data.urls: [config.defaultUrl];
    var param = {
      type: data.type,
      urls: {
        $in: urls
      },
      published: {
        $gt: new Date(currentDate - (2*dayMS)),
        $lt: currentDate
      }
    };
    modelFeed.find(param).sort({"published": -1}).lean(true).exec(function (err, data) {
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
  "sortByPublished": function(a ,b) {
    var dateA = new Date(a.published);
    var dateB = new Date(b.published);
    return dateA > dateB;
  },
};

module.exports = RSS;
