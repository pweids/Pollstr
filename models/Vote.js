var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
var Candidate = mongoose.model('Candidate').schema;

var Vote = new Schema({
    voter: ObjectId, //user who submitted the vote
    pref: [Candidate]
});

module.exports = mongoose.model("Vote", Vote);
