var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
    name:String,
    username: String,
    firstName: String,
    email:String,
    password: String,
    passwordConfirm:String,
    image:String,
});

UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model('User', UserSchema);

module.exports = User;


//...................PproductsSchema......................

