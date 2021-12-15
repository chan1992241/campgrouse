const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  }  
});

//This plugin will automatically add on username and password field to the schema
//This plugin will add hash and salt field to store the username and hashed password and the salt value
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)