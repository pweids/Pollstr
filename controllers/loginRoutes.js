var passport = require('passport');
var User = require('../models/User');
var Emailer = require('../controllers/emailer');

module.exports = function (app) {
    
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
        debugger;
       if (password !== passwordConfirm) {
           return res.send({'password error':'Passwords do not match'});
       }
       
        User.findOne({username : username }, function(err, existingUser) {
            if (err) {
                return res.send({'username error': err});
            }
            var user;
            if (existingUser) {
                if (existingUser.validated)
                    return res.send('user exists');
                else user = existingUser;
           } else {user = new User({ username: req.body.username});}
            user.setPassword(req.body.password, function(err) {
               if (err) {
                   return res.send({'password error': err});
               }
            user.save(function(err) {
                   if (err) {
                       return res.send({'save error': err});
                   }
                   debugger;
                   Emailer.sendMail({
                       from: "pollstr.app@gmail.com",
                       to: user.username,
                       subject: "Welcome to Pollstr - Please verify email",
                       html: "<h2>Hi, welcome to Pollstr</h2><p>Your account has successfuly been registered. " +
                       "Please follow the below link to verify your account and begin using Pollstr.</p>" +
                       "<pre><a href='http://localhost:8080/verify/" + user._id + "'>http://pollstr.us/verify/" +
                       user._id + "</a></pre><p>Happy voting!</p>"
                   });
                   
                   return res.redirect('/home');
               });
           });
       }); 
    });
    
    app.get('/verify/:uid', function(req, res) {
        console.log(req.params.uid);
        User.findOne({_id:req.params.uid}, function(err, user) {
            if (err) return res.send({'error':err});
            user.validated = true;
            user.save();
            return res.render('verified',
                {title: 'Verified',
                user:undefined,
                email:user.username});
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
    
    app.get('/about', function(req, res) {
        return res.render('about',
        {title: "About",
        user:req.user});
    });
}