var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var stylus = require('stylus');
var nib = require('nib');

function init() {
    var app = express();
    configureExpress(app);
    
    var User = initPassportUser();
    
    mongoose.connect('mongodb://localhost/myApp');
    
    require('./controllers/loginRoutes')(app);
    require('./controllers/pollRoutes')(app);
    
    app.get('*', function(req, res) {
       res.render('404',
       { title: '404',
       user: req.user}); 
    });
    
    var port = process.env.PORT | 8080;
    app.listen(port);
}

init();


function configureExpress(app) {
    app.configure(function(){
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');
        
        app.use(stylus.middleware(
            { src: __dirname + '/static',
            compile:compile
            }
        ));

        app.use(express.logger('dev'));
        
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        
        app.use(express.cookieParser('gerrymandering'));
        app.use(express.session());
        
        app.use(passport.initialize());
        app.use(passport.session());
         
        app.use(express.static(__dirname + '/static'));
        app.use(app.router);
      
    });
}

function compile(str, path) {
    return stylus(str)
        .set('filename', path)
        .use(nib());
}

function initPassportUser(){
    var User = require('./models/User');

    passport.use(new LocalStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    return User;
}