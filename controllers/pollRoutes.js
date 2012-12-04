var passport = require('passport');
var User = require('../models/User');
var Vote = require('../models/Vote');
var Poll = require('../models/Poll');
var Emailer = require('./emailer');

function isMod(user, pid) {
    
}

module.exports = function (app) {
    
    app.get('/createPoll', function(req, res) {
        if (req.user === undefined) {
            res.redirect('/login');
        }
        
        res.render('createPoll',
        {title: "Create a Poll",
        user: req.user});
    })
    
    app.post('/createPoll', function(req, res) {
        if (req.user === undefined) return res.send(401, "You must be logged in to do that.");
       
        var poll = new Poll(req.body);
        poll.mod_id = req.user._id;
        poll.active = true;
        poll.save(function(err) {
            if(err) {
                return res.send({'err': err});
            } else {
                req.user.polls.push(poll._id);
                req.user.save(function(err){
                    if (err) console.log('error: ', err);
                });
                res.set({flash: ["Successfully created poll!"]});
                return res.redirect("/home");
            }
        });
        
        
        /**
        User
        .findOneByIdAndUpdate(req.user._id, {$push: polls: poll._id})
        .
        **/
       
    });
    
    app.get('/myPolls', function(req, res) {
        if (req.user === undefined) res.status(401);
        
        var polls = ['hi'];
        User
        .findById(req.user._id)
        .populate('polls')
        .exec(function(err, User) {
            if (err) return res.send("error: ", err);
            
            return res.render('myPolls',
            {title: "My Polls",
            user: req.user,
            polls: User.polls});
        });
    });
    
    app.get('/poll/:pid', function(req, res) {
        if (req.user === undefined) res.status(401);
        
        Poll
        .findById(req.params.pid)
        .exec(function(err, poll) {
            if (err) return res.send("error: ", err);
            
            return res.render('viewPoll',
            {title: poll.title,
                user: req.user,
                poll: poll});
        });
    });
    
    app.get('/mod/:pid', function(req, res) {
       if (req.user === undefined) return res.send(401, 'unauthorized'); 
       
       Poll
       .findById(req.params.pid)
       .where('mod_id')
       .equals(req.user._id)
       .exec(function(err, poll) {
           if (err) return res.redirect('/home');
           
           return res.render("moderate",
           {title: poll.title,
               user: req.user,
               poll: poll});
       });
    });
    
    app.post('/share', function(req, res) {
        Poll
        .findById(req.body.pid)
        .where('mod_id')
        .equals(req.user._id)
        .exec(function(err, poll)
        {
            var emailer = new Emailer();
            var emails = req.body.emails.split(/\r?\n/g);
            if (err) res.send(400, "error");
            else {
                emailer.sendMail(emails, req.user.username + 
                    " has shared a poll with you: " + 
                    poll.title + ". Visit the link below to view <br />" +
                    "<a href='http://localhost:8080/poll/" + poll._id + ">Link</a>");
                res.send(200, "success"); 
            }
        });
    });
}