const mongoose = require('mongoose');
const moment = require('moment');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: false,
      trim: true,
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('Password not secure');
        }
      },
    },
    isNative: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      default: '',
    },
    resetPasswordExpiry: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt for each new entry
  },
);

// Custom instance function (not arrow fxn since we will use 'this')
userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const token = jwt.sign(
    {
      _id: user._id.toString(),
      expiration: moment().add(7, 'days').format('YYYY-MM-DD HH:mm'),
    },
    process.env.JWT_SECRET,
  );

  return token;
};

userSchema.methods.generateResetToken = async function () {
  const user = this;

  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject(); // get raw data without mongoose data and fxns for saving

  // cannot do this in mongoose instance
  delete userObject.password;

  return userObject;
};

// Custom model function
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return null;
  }
  return user;
};

// Hash plain text password before saving
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
