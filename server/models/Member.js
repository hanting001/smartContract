const mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken');
const updatedTimestamp = require('mongoose-updated_at');

var Schema = mongoose.Schema;

var schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    nickname: String,
    password: {
        type: String,
        required: true
    },
    account: String,
    keystore: Buffer,
    role: {
        type: [{
            type: String
        }],
        default: ['member']
    },
    accessToken: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'smartMembers'
});
schema.index({
    accessToken: 1
});
schema.plugin(updatedTimestamp);

schema.pre('save', function (next) {
    var user = this;
    //If the password has not been modified in this save operation, leave it alone (So we don't double hash it)
    if (!user.isModified('password')) {
        next();
        return;
    }
    //Retrieve the desired difficulty from the configuration. (Default = 8)
    var DIFFICULTY = 8;
    //Encrypt it using bCrypt. Using the Sync method instead of Async to keep the code simple.
    var hashedPwd = bcrypt.hashSync(user.password, DIFFICULTY);
    //Replace the plaintext pw with the Hash+Salted pw;
    user.password = hashedPwd;
    //Continue with the save operation
    next();
});


schema.methods.generateJWT = function () {
    // set expiration to 60 days
    let today = new Date();
    let exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    // console.log('process.env.secret' + process.env.secret);
    return jwt.sign({
        _id: this._id,
        username: this.name,
        role: this.role,
        exp: parseInt(exp.getTime() / 1000),
    }, process.env.secret || '432sfsdg234gdfgdhuibaokeji');
};

// checking if password is valid
schema.methods.validPassword = function (plainText) {
    return bcrypt.compareSync(plainText, this.password);
};
module.exports = mongoose.model('Member', schema);