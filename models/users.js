var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

//create a user schema
var UserSchema = new Schema({

    name: String,
    username: {type: String, required: true, index: {unique: true}},
    mobile: {type: String, require: true, index: {unique: true}},
    password: {type: String, required: true, select: false}

});


//validation and hashing
UserSchema.pre('save', function (next) {

    var user = this;

    if (!user.isModified('password'))return next();


    // hashing the password if no error and save it to database
    bcrypt.hash(user.password, null, null, function (err, hash) {
        if (err) {
            return next(err);
        }

        user.password = hash;
        next();
    });

});

//custom method to validate login - compare password

UserSchema.methods.comparePassword = function (password) {
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);