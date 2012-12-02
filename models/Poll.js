var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var Vote = mongoose.model('Vote').schema;
var Candidate = mongoose.model('Candidate').schema;

var Poll = new Schema({
    title: String,
    style: String, //Polling method 'FPTP' or 'Preferential'
    candidates: [Candidate], //String Array of Candidate Names
    mod_id: ObjectId, //User who created/moderates the poll
    users: [ObjectId], //List of users who can submit votes
    active: Boolean, //Is the poll still accepting votes?
    votes: [Vote], //JSON array of submitted votes i.e. [{email:"email", pref:[String]}]
    quorum: Number, //Optional minimum number of votes to 
    numWinners: Number, //Number of potential winners
    winners: [Candidate] //When active becomes false, votes are parsed and the winners field is populated
});

module.exports = mongoose.model('Poll', Poll);
