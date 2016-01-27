var express = require('express');
var router = express.Router();

var RSS = require('../workers/RSS');

/* GET home page. */
router.get('/', function(req, res, next) {
  RSS.get({'type':'main'}, function (data) {
    res.render('index', {'data': data});
  });
});

router.get('/social', function(req, res, next) {
  RSS.get({'type':'social'}, function (data) {
    res.render('index', {'data': data});
  });
});

router.get('/finanshials', function(req, res, next) {
  RSS.get({'type':'finanshials'}, function (data) {
    res.render('index', {'data': data});
  });
});

router.get('/auto', function(req, res, next) {
  RSS.get({'type':'auto'}, function (data) {
    res.render('index', {'data': data});
  });
});

router.get('/sport', function(req, res, next) {
  RSS.get({'type':'sport'}, function (data) {
    res.render('index', {'data': data});
  });
});

router.get('/builds', function(req, res, next) {
  RSS.get({'type':'builds'}, function (data) {
    res.render('index', {'data': data});
  });
});

router.post('/save', function(req, res, next) {
  RSS.saveUrl({
    'type':req.body.type,
    'url':req.body.url,
    'title': req.body.title,
    'checked': 'checked',
    'icon': req.body.icon
  }, function (data) {
    res.send(data);
  });
});

router.post('/saveFilter', function(req, res, next) {
  RSS.saveFilter({'val':req.body.val}, function (data) {
    res.send(data);
  });
});

router.post('/checkUrl', function(req, res, next) {
  RSS.checkUrl({
    'url':req.body.url,
    'state': req.body.state,
    'type': req.body.type
  }, function (data) {
    res.send(data);
  });
});

router.post('/updateNews', function(req, res, next) {
  RSS.updateNews({
    'type': req.body.type || 'main',
    'urls': req.body.urls,
    'last': req.body.last
  }, function (data) {
    res.send(data);
  });
});




module.exports = router;
