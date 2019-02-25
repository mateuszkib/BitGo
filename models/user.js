let mongoose = require('mongodb');

let userSchema = mongoose.Schema({
    email: String,
    password: String
});

module.exports = mongoose.model('users', userSchema);