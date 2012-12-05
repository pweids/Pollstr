var passport = require('passport');
var User = require('../models/User');

module.exports = function (app) {
    
    function validateEmail(email) { 
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    
    app.get('/', function (req, res) {
        if (req.user === undefined) {
            res.render('index',
            { title: 'Home',
            user: req.user }
            );
        } else {
            res.render('home',
            {title: 'Home',
            user: req.user});
        }
    });
    
    app.post('/register', function(req, res) {
       var username = req.body.username;
       var password = req.body.password;
       var passwordConfirm = req.body.passwordConfirm;
       
       if (!validateEmail(username)) {
           return res.send({'username error': 'not a valid email address'});
       }
       if (password !== passwordConfirm) {
           return res.send({'password error':'Passwords do not match'});
       }
       
       User.findOne({username : username }, function(err, existingUser) {
           if (err) {
               return res.send({'username error': err});
           }
           if (existingUser) {
               return res.send('user exists');
           }
           
           var user = new User({ username: req.body.username });
           user.setPassword(req.body.password, function(err) {
               if (err) {
                   return res.send({'password error': err});
               }
               user.save(function(err) {
                   if (err) {
                       return res.send({'save error': err});
                   }
                   return res.redirect('/home');
               });
           });
       }); 
    });
    
    app.get('/login', function(req, res) {
        if (req.user !== undefined) {
            res.redirect('/');
        } else {
            res.render('login',
            {title:"Log In",
            user:req.user});
        }
    });
    
    app.post('/login', passport.authenticate('local'), function(req, res) {
        console.log(req.user.id);
       req.user.save();
       return res.redirect('/home'); 
    });
    
    app.get('/register', function(req, res) {
        if (req.user !== undefined) {
            res.redirect('/');
        } else {
            res.render('register',
            {title:"Register",
            user:req.user});
        }
    })
    
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
    app.get('/home', function(req, res) {
        if (req.user === undefined)
            return res.redirect('/login');
        return res.render('home',
        {title: "Home",
        user:req.user});
        /*
        var testUser = User.findOne({username:'paulw@cmu.edu'}, function(err, user) {
            if (err) console.log("err: ", err);
            req.login(user, function(err){if(err)console.log("login err:", err)});
            return res.render('home',
            { title: "Home",
            user: user});
        });
         */
    });
}