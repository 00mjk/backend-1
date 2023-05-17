import crypto from 'crypto';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  fname: {
    type: String,
    minlength: 2,
    trim: true
  },
  sname: {
    type: String,
    minlength: 2,
    trim: true
  },
  workEmail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  persEmail: {
    type: String,
    trim: true
  },
  profilePic: {
    type: String,
    default: null
  },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  supervisor: String,
  position: String,
  bitrixID: {
    type: Number,
    index: true,
    // unique: true
  },
  mobPhoneOne: String,
  mobPhoneTwo: String,
  deskPhone: String,
  country: String,
  accType: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  planAmount: Number,
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  leave: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserLeave'
  },
  access: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Access'
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.matchPasswords = async function (password) {
  const test = bcrypt.compare(password, this.password);
  return await test;
};
userSchema.methods.getSignedToken = function () {
  return jwt.sign({ workEmail: this.workEmail, id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);
  return resetToken;
};

const UserInfo = mongoose.model('User', userSchema);

export default UserInfo;
// add validation to check bitrix id