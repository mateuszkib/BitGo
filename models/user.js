let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    email: String,
    password: String,
    idWallet: Array
});

module.exports = mongoose.model('users', userSchema);