var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var Vote = new Schema({
    voter: {type: Schema.Types.ObjectId, ref: 'User'}, //user who submitted the vote
    pref: [String]
});

module.exports = mongoose.model("Vote", Vote);
