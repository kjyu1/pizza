/**
 * Created by Kevin on 5/17/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderSchema = new Schema({
    email: String,
    pizza: String
});

module.exports = mongoose.model('orders', orderSchema);