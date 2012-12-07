var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var Poll = new Schema({
    title: String,
    style: String, //Polling method 'FPTP' or 'Preferential'
    candidates: [String], //String Array of Candidate Names
    mod_id: {type: Schema.Types.ObjectId, ref: 'User'}, //User who created/moderates the poll
    users: [{type: Schema.Types.ObjectId, ref: 'User'}], //List of users who can submit votes
    active: Boolean, //Is the poll still accepting votes?
    privacy: {type: String, default: "private"},
    votes: [{username:String, vote: [String]}], //JSON array of submitted votes i.e. [{email:"email", pref:[String]}]
    quorum: { type: Number, default: 0}, //Optional minimum number of votes to 
    winner: String //When active becomes false, votes are parsed and the winners field is populated
});

module.exports = mongoose.model('Poll', Poll);
