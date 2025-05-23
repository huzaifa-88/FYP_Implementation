const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    maxlength: 500
  },
  lastname: {
    type: String,
    maxlength: 500
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 500
  },
  password: {
    type: String,
    required: true,
    maxlength: 500
  },
  UserRole: {
    type: String,
    required: true,
    enum: ['admin', 'doctor', 'chemist', 'user'], // extend as needed
    maxlength: 500
  },
  city: {
    type: String,
    maxlength: 500
  },
  country: {
    type: String,
    maxlength: 500
  },
  postalCode: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
