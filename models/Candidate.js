var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var Candidate = new Schema({
    num: Number,
    value: String
});

module.exports = mongoose.model("Candidate", Candidate);