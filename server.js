var express = require('express');

var passport = require('passport');
var PassportLocalStrategy = require('passport-local').Strategy;
var stylus = require('stylus');
var nib = require('nib');

function init() {
    var app = express();
    configureExpress(app);

}

init();

function configureExpress(app) {
    app.configure(function(){
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');

        app.use(express.logger('dev'));
        app.use(express.cookieParser());
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(stylus.middleware(
            { src: __dirname + '/static',
            compile:compile
            }
        ));
        app.use(express.static(__dirname + '/static'));
    });
    app.listen(8080);
}

function compile(str, path) {
    return stylus(str)
        .set('filename', path)
        .use(nib());
}

function initPassportUser(){
    var User = require('./User');

    passport.use(new LocalStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    return User;
}