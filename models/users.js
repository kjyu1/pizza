/**
 * Created by Kevin on 5/17/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    email: String,
    password: String
});

module.exports = mongoose.model('users', userSchema);