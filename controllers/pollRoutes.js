var passport = require('passport');
var User = require('../models/User');
var Vote = require('../models/Vote');
var Poll = require('../models/Poll');
var Emailer = require('../controllers/emailer');

// HELPER METHODS
function ensureNoDupes(voteArray) {
    for (var i = 0; i < voteArray.length-1; i++) {
        for (var j = i+1; j < voteArray.length; j++) {
            if (voteArray[i].username === voteArray[j].username)
                return false;
        }
    }
    return true;
}

function countCheck(numVotes, voteCount) {
    var count = 0;
    var i, n = voteCount.length;
    for (var i = 0; i < n; i++) {
        count += voteCount[i];
    }
    if (numVotes !== count) console.log("Error - mismatched counts: got " + count + ", expected " + numVotes);
}

//Add method to Array prototype to set all values to 'v'

Array.prototype.setAll = function(v) {
    var i, n = this.length;
    for (i = 0; i < n; ++i)
        this[i] = v;
}


//Find indices of lowest/highest votes. Loser boolean denotes high or low order

function getIndex(countArray, loser) {
    var i, n = countArray.length;
    var point = loser ? Infinity : -Infinity;
    var index = [-1];
    for (i = 0; i < n; i++) {
        if ( loser ? point > countArray[i] : point < countArray[i]) {
            point = countArray[i];
            index = [i];
        } else if (point === countArray[i]) {
            index.push(i);
        }
    }
    return index;
}

// Returns an array with votes for each candidate
function simpleCount(candidates, votes, index) {
    var i = index || 0;
    var a = new Array(candidates.length);
    a.setAll(0);
    
    var j = 0, n = votes.length;
    for (j; j < n; j++) {
        a[candidates.indexOf(votes[j].vote[i])]++;
    }
    return a;
}

function closePoll(poll, voteCount, winner) {
    if (!winner) {
        var wIndex = getIndex(voteCount);
        if (wIndex[0] === -1) return "error, no votes";
        else {
            if (wIndex.length > 1) {
                winner = "A tie between " + poll.candidates[wIndex[0]];
                var i, n = wIndex.length;
                for (i = 1; i < n; i++)
                    winner += ', ' + poll.candidates[wIndex[1]];
            } else winner = poll.candidates[wIndex[0]];
        }
   }
   poll.winner = winner;
   poll.active = false;
   poll.save();
}



//The actual counting algorithms
function countVoteFPTP(poll) {
    var voteCount = simpleCount(poll.candidates, poll.votes);
    closePoll(poll, voteCount);
}


function countVoteBorda(poll) {
    var candidates = poll.candidates;
    var i, n = candidates.length;
    var voteCount = simpleCount(candidates, poll.votes, n-1);
    debugger;
    for (i = 0; i<n-1; i++) {
        var newVote = simpleCount(candidates, poll.votes, i);
        var j = 0, m = newVote.length;
        for (j; j < m; j++) {
            voteCount[j] += newVote[j]*(n-i);
        }
    }
    
    closePoll(poll, voteCount);
}


function countVoteIRV(poll) {
    var candidates  = poll.candidates;
    var votes       = poll.votes;
    var voteCount   = simpleCount(candidates, votes);
    var index       = getIndex(voteCount);
    
    while (index.length > 1 || voteCount[index[0]]/votes.length < 0.5) {
        //Clear out the losers
        var lindex = getIndex(voteCount, true);
        //If every candidate is in last place, there is a dead tie. So we switch to a borda count
        if (lindex.length === candidates.length) {
            countVoteBorda(poll);
            return;
        } else if (lindex.length > 1) {
            //tie handling algorithm
            lindex.sort(function(a,b){return b-a});
            var tmpVoteCount = voteCount.slice();
            var tmpCandidates = candidates.slice();
            var tmpvote = 0;
            for (var i = 0; i < lindex.length; i++) {
                tmpvote += voteCount[lindex[i]];
                tmpVoteCount.splice(lindex[i],1);
                tmpCandidates.splice(lindex[i],1);
            }
            debugger;
            var lindex2 = getIndex(tmpVoteCount,true);
            //If the next highest candidate has more than all losers combined,
            // we can elimiate the two losers and move on
            // Otherwise we switch to Borda Count
            if (tmpvote < tmpVoteCount[lindex2[0]]) {
                candidates = tmpCandidates;
                voteCount = tmpVoteCount;
            } else {
                countVoteBorda(poll);
                return
            }
        } else candidates.splice(lindex[0],1);
        
        //Remove entries in vote and re tabulate the vote
        for (var i = 0; i < votes.length; i++) {
            while (candidates.indexOf(votes[i].vote[0]) === -1) votes[i].vote.shift();
        }
        voteCount = simpleCount(candidates, votes);
        index = getIndex(voteCount);
    }
    closePoll(poll, null, candidates[index[0]]);
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
    
    //For private polls sent to unverified email addresses
    app.get('/poll/:pid/:uid', function(req, res) {
        
        console.log(req.params.pid, req.params.uid);
        
        Poll
        .findById(req.params.pid)
        .populate('users')
        .exec(function(err, poll) {
            if (err) return res.send({"error":err});
            if (!poll || poll.privacy === "public") return res.render('404', {title:'Not Found', user:req.user});
            else {
                User
                .findById(req.params.uid)
                .exec(function(err, user) {
                    if (err) return res.send({'error' : err});
                    if (!user) return res.send(400);
                    
                    var canVote = true;
                    for (var i = 0; i < poll.votes.length; i++) {
                        if (poll.votes[i].username === user.username) {
                            canVote = false;
                            break;
                        }
                    }
                    
                    return res.render('viewPoll',
                    {title : poll.title,
                        user:user,
                        poll:poll,
                        canVote : canVote});
                    
                })
            }
        });
    })
    
    //For public & private polls when logged in & verified
    app.get('/poll/:pid', function(req, res) {
        if (req.user === undefined) return res.redirect('/login');
        
        Poll
        .findById(req.params.pid)
        .where('users.username')
        .exec(function(err, poll) {
            if (err) return res.send("error: ", err);
            
            if (!poll) return res.render('404', {title:'Not Found', user:req.user});
            
            if (poll.privacy === 'private') {
                 if (!poll.mod_id.equals(req.user._id) && poll.users.indexOf(req.user._id) === -1)
                     return res.send(401, "Email address not verified");
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
        
        var emails = req.body.emails.split(/\r?\n/g);
        console.log(emails);
        
        Poll
        .findById(req.body.pid)
        .where('mod_id')
        .equals(req.user._id)
        .populate('users')
        .exec(function(err, poll)
        {
            if (err) return res.send(400);
            if (!poll) return res.send(400);
        
            User
            .find()
            .where('username')
            .in(emails)
            .exec(function (err, eusers) {
                if (err) {console.log(err); return;}
                else {
                    var i, n = emails.length;
                    for (i = 0; i < n; i++) {
                        debugger;
                        var user;
                        if (eusers && eusers.indexOf(emails[i].username) !== -1) user = eusers[eusers.indexOf(emails[i].username)];
                        else user = new User({username: emails[i]});
                        user.polls.push(poll._id);
                        user.save();
                        poll.users.push(user);
                        poll.save();
                        Emailer.sendMail({
                               from: "pollstr.app@gmail.com",
                               to: user.username,
                               subject: "A poll has been shared with you",
                               html: "<p>" + req.user.username + " has shared a poll, \""+poll.title+",\" with you." +
                               "Please follow the below link to vote in your poll.</p>" +
                               "<a href='http://128.237.250.255:8080/poll/" + poll._id + "/" + user._id + "'>Vote!</a>" +
                               "<p>You can only vote once. You can register this email address to access all of your polls</p>"+
                               "<p>Happy voting!</p>"
                           });
                        console.log("Added " + user.username + " to " + poll.title);
                    }
                }
            });   
            return res.redirect('/myPolls');
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
            //console.log(poll.votes);
            if (poll)
                if (poll.style === 'fptp')
                    countVoteFPTP(poll);
                else if (poll.style === 'irv')
                    countVoteIRV(poll);
                else countVoteBorda(poll);
            return res.send(200, "The winner is " + poll.winner);
        }); 
    });
    
    app.post('/vote', function(req, res) {
        var pid = req.body.pid;
        var uname = req.user ? req.user.username : req.body.uid;
        
        var vote = {username:uname,
            vote:req.body.candidate};
        
        console.log(req.body.candidate);
        debugger;
        Poll
        .findById(pid)
        .populate('users')
        .populate('mod_id')
        .where('votes.username').nin([uname])
        .exec(function (err, poll) {
            if (err) return res.send(400);
            if (!poll) return res.send(401, "You already voted ass wipe");
            else {
                if (poll.privacy === 'private') {
                    var i, n = poll.users.length;
                    var flag = false;
                    for (i = 0; i < n; i++) {
                        if (poll.users[i].username === uname) flag = true;
                    }
                    if (poll.mod_id.username === uname) flag = true;
                    if (!flag) return res.send(401);
                }
                if(req.user && req.user.polls.indexOf(poll._id) === -1) {
                    req.user.polls.push(poll._id);
                    req.user.save();
                }
                if (vote.vote === '_abstain_') {
                    poll.quorum = poll.quorum > 0 ? poll.quorum - 1 : 0;
                    poll.save();
                } else {
                    poll.votes.push(vote);
                    poll.save();
                }
                return res.send(201, "Success");
            }
        });    
    });
}