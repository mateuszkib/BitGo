let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    email: String,
    password: String,
    idWallet: String
});

module.exports = mongoose.model('users', userSchema);