require('../lib/db');

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Blog = mongoose.model('Blog');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.locals.username = req.session.name;
  res.locals.authenticated = req.session.logined;

  //透過find找出Blog模型資料庫中所有文章，生成頁面時把文章存在blogs物件中，在傳回放到頁面中
  Blog.find(function(err, blogs, count) {
    res.render('index', {
      title: '武漢肺炎疫情討論區',
      user: req.session.user,
      blogs: blogs
    });
  });
  // res.render('index', { title: '武漢肺炎疫情集中討論板' });
});



module.exports = router;
