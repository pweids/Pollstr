var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    polls: [ObjectId] //An array of polls this user has access to
});

User.plugin(passportLocalMongoose); //adds username, password to schema

module.exports = mongoose.model('User', User);