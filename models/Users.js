const crypto = require('crypto')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
name:{
    type:String,
    require:[true,'please add a name']
},
email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
role:{
    type:String,
    enum:['user','publisher','admin'],
    default:'User'
},
password:{
    type:String,
    require:[true,'please add a password'],
    minlength:6,
    select:false,
},
resetPasswordToken: String,
resetPasswordExpire: Date,
createAt: {
    type:Date,
    default:Date.now
}
})

UserSchema.pre('save', async function(next){
  if (!this.isModified('password')) {
    next();
  }
const salt = await bcrypt.genSalt(10)
this.password = await bcrypt.hash(this.password,salt)
})

UserSchema.methods.getSignedJwtToken = function(){
return jwt.sign({id:this._id},process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRED
})
}

UserSchema.methods.matchPassword = async function(enteredPass){
  return await bcrypt.compare(enteredPass,this.password)
}

UserSchema.methods.getResetPasswordToken = async function(){
  const resetToken = crypto.randomBytes(20).toString('hex')
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
}

module.exports = mongoose.model('User', UserSchema)