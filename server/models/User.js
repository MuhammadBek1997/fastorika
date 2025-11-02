const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  // Profile fields
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  country: { type: String },
  birthDate: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);