var passport = require('passport');
var User = require('../models/User');
var Vote = require('../models/Vote');
var Poll = require('../models/Poll');
var Emailer = require('./emailer');

// HELPER METHODS
function ensureNoDupes(voteArray) {
    for (var i = 0; i < voteArray.length-1; i++) {
        for (var j = i; j < voteArray.length; j++) {
            if (voteArray[i].username === voteArray[j].username)
                return false;
        }
    }
    return true;
}

function setAll(a, v) {
    var i, n = a.length;
    for (i = 0; i < n; ++i) {
        a[i] = v;
    }
}

function winnerIndex(countArray) {
    var i, n = countArray.length;
    var hiCount = 0, index = [-1];
    for (i = 0; i < n; i++) {
        if (hiCount < countArray[i]) {
            hiCount = countArray[i];
            index = [i];
        } else if (hiCount === countArray[i] && index !== i) {
            index.push(i);
        }
    }
    return index;
}

function countVote(poll) {
    if (!ensureNoDupes(poll.votes)) throw "Duplicate voters!";
        //fptp method right now
    var voteCount = new Array(poll.candidates.length);
    setAll(voteCount, 0);
    
    var i, n = poll.votes.length;
    for (i = 0; i < n; i++) {
        var vote = poll.votes[i].vote[0];
        if (vote !== '_abstain_') {
            var index = poll.candidates.indexOf(vote);
            voteCount[index] += 1;
        }
    }
    var wIndex = winnerIndex(voteCount);
    if (wIndex[0] === -1)
        console.log("error -- no votes found");
    else if (wIndex.length > 1) {
        var resText = "The poll resulted in a tie between";
        var i, n = wIndex.length;
        for (i = 0; i < n; i++) {
            resText += " " + poll.candidates[wIndex[i]];
        }
        console.log(resText);
    } else {
        var winner = poll.candidates[wIndex[0]];
        poll.winners.push(winner);
        poll.active = false;
        poll.save();
        console.log('Winner of poll is ' + winner);
    }
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
        console.log(req.body);
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
                return res.redirect("/myPolls");
            }
        });
        
        
        /**
        User
        .findOneByIdAndUpdate(req.user._id, {$push: polls: poll._id})
        .
        **/
       
    });
    
    app.get('/myPolls', function(req, res) {
        if (req.user === undefined) return res.redirect('/login');
        
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
        //if (req.user === undefined) return res.send(401, "unauthroized");
        
        Poll
        .findById(req.params.pid)
        .populate('users')
        .exec(function(err, poll) {
            if (err) return res.send("error: ", err);
            
            if (poll.privacy === 'private') {
                debugger;
                if (req.user === undefined)
                    return res.redirect('/login');
                else {
                    if (!poll.mod_id.equals(req.user._id) && poll.users.indexOf(req.user) === -1)
                        return res.send(401, "unauthorized");
                }
            }
            
            var canVote = true;
            for (var i = 0; i < poll.votes.length; i++) {
                if (poll.votes[i].username === req.user.username) {
                    canVote = false;
                    break;
                }
            }
            
            return res.render('viewPoll',
            {title: poll.title,
                user: req.user,
                poll: poll,
                canVote: canVote});
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
        if (req.user === undefined) return res.send(401);
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
                res.send(201, "success"); 
            }
        });
    });
    
    app.get('/delete', function(req, res) {
        if (req.user === undefined) return res.redirect('/login');
        var pid = req.query.pid;
        console.log('Attempting to delete poll ' + pid);
       
        Poll
        .findById(pid)
        .populate('users')
        .where('mod_id')
        .equals(req.user._id)
        .exec(function(err, poll) {
            if (err) return res.redirect('/home');
           
            console.log('line 133: poll.users: ', poll.users);
            debugger;
            for (var i = 0; i < poll.users.length; i++) {
                console.log('line 136: poll.users[i]', poll.users[i]);
               
                User
                .findByIdAndUpdate(poll.users[i]._id, { $pull: {polls:pid} })
                .exec(function (err, user) {
                    if (err) console.log('update error', err);
                });
            }    
            
            User
            .findByIdAndUpdate(req.user._id, { $pull : {polls:pid} })
            .exec(function (err, user) {
                if (err) console.log('update mod error: ', err);
            })
            
            Poll
            .findByIdAndRemove(poll._id)
            .exec(function (err, poll) {
                if (err) return res.send(400, err);
                else {
                    console.log('deleted poll');
                    return res.redirect('/home');
                }
            }); 
            
        });
               
    }); 
    
    
    
    app.get('/end', function(req, res) {
        if (req.user === undefined) return res.send(401, "Unauthorized");
        Poll
        .findById(req.query.pid)
        .where('mod_id')
        .equals(req.user._id)
        .exec(function(err, poll) {
            if(err) return res.send(400);
            console.log(poll);
            if (poll)
                countVote(poll);
            return res.send(200);
        }); 
    });
    
    app.post('/vote', function(req, res) {
        var pid = req.body.pid;
        var uid = req.user._id;
        
        var vote = {username:req.user.username,
            vote:req.body.candidate};
        
        console.log(req.body.candidate);
        debugger;
        Poll
        .findByIdAndUpdate(pid,{ $push: {votes: vote}})
        .populate('users')
        .where('votes.username').nin([req.user.username])
        .exec(function (err, poll) {
            if (err) return res.send(400);
            if (!poll) return res.send(401, "You already voted ass wipe");
            else {
                if(req.user.polls.indexOf(poll._id) === -1) {
                    req.user.polls.push(poll._id);
                    req.user.save();
                }
                return res.send(201, "Success");
            }
        });    
    });
}