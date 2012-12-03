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
            { title: 'Home' }
            );
        } else {
            res.end('Logged In!');
        }
    });
    
    app.post('/register', function(req, res) {
       var username = req.body.username;
       var password = req.body.password;
       var passwordConfirm = req.body.passwordConfirm;
       
       console.log(req.body);
       
       if (!validateEmail(username)) {
           res.send({'username error': 'not a valid email address'});
       }
       if (password !== passwordConfirm) {
           res.send({'password error':'Passwords do not match'});
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
                   return res.send('success');
               });
           });
       }); 
    });
    
    app.post('/login', passport.authenticate('local'), function(req, res) {
       req.user.save();
       return res.send('success\n<a href="/logout">logout</a>'); 
    });
    
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    })
}