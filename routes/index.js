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
  RSS.saveUrl({'type':req.body.type, 'url':req.body.url}, function (data) {
  });
});

router.post('/saveFilter', function(req, res, next) {
  RSS.saveFilter({'val':req.body.val}, function (data) {
  });
});




module.exports = router;
