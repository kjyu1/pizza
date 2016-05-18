var express = require('express');
var router = express.Router();

var usersModel = require('../models/users');
var ordersModel = require('../models/orders');

//var moment = require('moment');
//moment().format();


var session = require('client-sessions');
router.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;asdasdasdqwe134535;l1;5l13;\]to8',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  cookie: {
    ephemeral: true,
    httpOnly: true
  }
}));

router.use(function(req, res, next) {
  if (req.session && req.session.user) {
    usersModel.findOne({ email: req.session.user.email }, function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user;  //refresh the session value
        res.locals.user = user;
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
});

function requireLogin (req, res, next) {
  if (!req.user) {
    res.redirect('/');
  } else {
    next();
  }
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('loginRegister');
});

router.get('/createOrder', requireLogin, function(req, res) {
  res.render('createOrder');
});

router.get('/showUpdatePage/:id', requireLogin, function(req, res){
  //res.render('updateOrder');
  var id = req.params.id;
  ordersModel.find({_id:id}, function (err,doc) {
      if (err) throw err;
      if(doc[0].email === req.session.user.email) {
        console.log(doc);
        res.render('updateOrder', {order: doc[0]});
      } else {
        res.redirect('/allOrders');
      }
  });
});

router.post('/updateOrder/:id', function(req,res) {
  var id = req.params.id;
  console.log(req.body.pizza);
  ordersModel.findByIdAndUpdate(id, { $set: { pizza: req.body.pizza }}, function(err,doc) {
    if (err) throw err;
    console.log(doc);
    res.redirect('/allOrders');
  });
});

router.get('/allOrders', requireLogin, function(req, res){
  ordersModel.find({},function(err,docs) {
    if(err) throw err;
    res.render('allOrders', { email: req.session.user.email, orders: docs});
  });
});

router.post('/register', function(req,res) {
  var newUser = new usersModel({
    email: req.body.email,
    password: req.body.password
  });
  newUser.save(function(err,doc) {
    if(err) throw err;
    res.redirect('/');
  });
});

router.post('/login', function(req, res) {
  usersModel.findOne({ email: req.body.email }, function(err, user) {
    if (!user) {
      res.redirect('/');
    } else {
      if (req.body.password === user.password) {
        // sets a cookie with the user's info
        req.session.user = user;
        res.redirect('allOrders');
      } else {
        //alert("Email and/or Password Incorrect!");
        res.redirect('/');
      }
    }
  });
});

router.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

router.post('/makeOrder', function(req, res) {
  var newOrder = new ordersModel({
    email: req.session.user.email,
    pizza: req.body.pizza
  });
  newOrder.save(function(err,doc) {
    if (err) throw err;
    res.redirect('/allOrders');
  });
});

router.get('/delete/:id', function(req,res) {
  var id = req.params.id;
  ordersModel.find({_id:id}, function(err, order) {
    if(err) throw (err);
    var email = order[0].email;
    if(req.session.user.email === email) {
      ordersModel.findByIdAndRemove(id, function (err) {
        if (err) throw err;
      });
    };
  });
  res.redirect('/allOrders');
});

module.exports = router;
