require('../lib/db');

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
// var Comment = mongoose.model('Comment');
var Blog = mongoose.model('Blog');
var User = mongoose.model('User');
var Message = mongoose.model('Message');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* 使用者註冊頁面 */
router.get('/register', function(req, res) {
  if(req.session.logined) {
    res.redirect('/');
    return;
  }
  res.render('./users/register', { title: '註冊' });
});

/* 使用者註冊動作 */
router.post('/register_action', function(req, res, next) {
  // if(!(req.body.user) || !(req.body.passwd)) {
  //   res.redirect('/users/register');
  //   return;
  // }  
  // req.session.name = req.body.name;
  // req.session.passwd = req.body.passwd;
  // req.session.logined = true;
  // res.redirect('/');

  /* 如果user跟passwd欄位都有填 */
  if(req.body.user && req.body.passwd) {
    /* 如果資料庫中只找到一個 */
    User.findOne({Username: req.body.user}).exec(function(err, result) {
      if(result == null) {
        /* 儲存資料 */
        var temp = new User({
          Username: req.body.user,
          Password: req.body.passwd
        }).save(function(err) {
          req.session.logined = true;
          req.session.user = req.body.user;
          res.redirect('/');
        });
        
      } else {
        res.redirect('/users/register');
      }
    });
  } else {
    /* 重新導回註冊頁面 */
    res.redirect('/users/register');
  }
});

/* 使用者登入頁面 */
router.get('/login', function(req, res) {
  if(req.session.logined) {
    res.redirect('/');
    return;
  }
  res.render('./users/login', { title: '登入' });
});

/* 使用者登入動作 */
router.post('/login_action', function(req, res) {
  if(req.session.logined) {
    res.redirect('/');
  } else {
    if(req.body.user && req.body.passwd) {  
      User.findOne({ Username: req.body.user, Password: req.body.passwd }).exec(function(err, result) { ///req.body.user打成req.body.name
        if(result !== null) {
          req.session.logined = true;
          req.session.user = req.body.user;
          res.redirect('/');
        } else {
          res.redirect('/users/login');
        }
      });
    } else {
      res.redirect('/users/login');
    }
  }
});

/* 使用者登出 */
router.get('/signout', function(req, res) {
  req.session.logined = false;
  res.redirect('/');
  res.end();
});

/* 新增文章頁面 */
router.get('/add_article', function(req, res) {
  if(!(req.session.logined)) {
    res.redirect('/');;
    return;
  }
  res.locals.username = req.session.name;
  res.locals.authenticated = req.session.logined;
  res.render('./users/add_article', {title: '新增文章', user: req.session.user});
});


/* 新增文章功能 */
router.post('/add', function(req, res, next) {
  if(!(req.session.user)) {
    console.log("被Redirect了QQ");
    res.redirect('/');
  } else {
    console.log(req.session.user + " " + req.body.Content + " " + Date.now());
    var temp = new Blog({
      Username: req.session.user,
      Article: req.body.Content,
      CreateDate: Date.now()
    }).save(function(err) {
      res.redirect('/');
    });

    // new Blog({
    //   Username: req.session.name,
    //   Article: req.body.Content,
    //   CreateDate: Date.now()
    // }).save(function(err) {
    //   if(err) {
    //     console.log('Fail to save to DB.');
    //   }
    //   console.log('Save to DB');
    // });
    // res.redirect('/');
  }
});

/* 文章功能頁面(包含留言、修改等功能) */
router.get('/article/:id', function(req, res) {

  var ID = req.params.id;

  /* 找出這篇文章的留言 要加上一些條件 */
  Message.find({ ArticleID: req.params.id }, function(err, message) {
    if(!err) {
      Blog.findOne({_id: ID}).exec(function(err, result_blog) {
          
        res.render('./users/article', {
          article_id: ID,
          article_author: result_blog.Username,
          article_content: result_blog.Article,
          session_logined: req.session.logined,
          session_name: req.session.user,
          result_message: message,
        });
        console.log("result_message結果" + message);
      });
    }


    });
    
  });


  // //find可能會找到很多個 要用Array方式存取result； findOne只會找到一個 可以直接用result的值
  // Blog.findOne({_id: ID}).exec(function(err, result) {
  //   res.render('./users/article', {
  //     article_id: ID,
  //     article_author: result.Username,
  //     article_content: result.Article,
  //     session_logined: req.session.logined,
  //     session_name: req.session.user,
  //     message: messageContainer
  //   });
  // });

  


/* 修改文章頁面 */
router.get('/change_article/:id', function(req, res) {
  /* 保護防止沒登入，系統崩潰 */
  if(!req.session.logined) {
    redirect('/');
  } else {
    /* 找到該ID物件 */
    Blog.findOne({_id: req.params.id}).exec(function(err, result) {
      
      /* result為該物件 生成change_article頁面 */
      res.render('./users/change_article', {
        title: '修改文章',
        user: req.session.user,
        previous_content: result.Article,
        article_id: req.params.id, 
      });
    });
  }
});

/* 修改文章功能 */
router.post('/change/:id', function(req, res) {
  Blog.update({_id: req.params.id}, {Article: req.body.Content}, function(err) {
    if(err) {
      console.log('Unable to update the article!');
    } else {
      console.log('Successful!');
    }
    res.redirect('/');
  })
});

/* 刪除文章功能 */
router.get('/delete_article/:id', function(req, res) {
  Blog.remove({_id: req.params.id}, function(err) {
    if(err) {
      console.log('Unable to remove the article!');
    } else {
      console.log('Successful!');
    }
    res.redirect('/');
  });
});

/* 留言頁面生成 */
router.get('/message/:article_id', function(req, res) {
  /* 無論有沒有登入都可以留言 */
  var User;
  if(req.session.logined) {
    User = req.session.user;
  } else {
    User = "訪客" + Date.now();
  }
  res.render('./users/message', {
    title: '留言',
    user: User,
    article_id: req.params.article_id,
    session_logined: req.session.logined
  });
});

/* 留言功能 */
router.post('/add_message/:user/:article_id', function(req, res) {
  var temp = new Message({
    Visitor: req.params.user,
    Comment: req.body.Content,
    ArticleID: req.params.article_id,
    // MessageID: req.params.user,
    CreateDate: Date.now()
  }).save(function(err) {
    if(err) {
      console.log('Save process denied.');
      res.redirect('/');
    } else {
      res.redirect('/');
    }
  });
});

/* 修改留言頁面 */
router.get('/change_message/:message_id', function(req, res) {
  console.log(req.session.user);
  /* 只有登入者才可以修改留言 */
  if(!req.session.logined) {
    res.redirect('/');
  } else {
    Message.findOne({_id: req.params.message_id}).exec(function(err, result) {
      res.render('./users/change_message', {
        title: '修改留言',
        user: req.session.user,
        previous_content: result.Comment, 
        message_id: req.params.message_id
      });
    });
  }
  
});

/* 修改留言功能 */
router.post('/change_message/:message_id', function(req, res) {
  Message.update({_id: req.params.message_id}, {Comment: req.body.Content}, function(err) {
    if(err) {
      console.log('Unable to update the message!');
    } else {
      console.log('Successful!');
    }
    res.redirect('/');
  });
});

/* 刪除留言 */
router.get('/delete_message/:message_id', function(req, res) {
  Message.remove({_id: req.params.message_id}, function(err) {
    if(err) {
      console.log('無法順利刪除留言');
    } else {
      console.log('已經成功刪除留言!');
    }
    res.redirect('/');
  });
});



module.exports = router;

