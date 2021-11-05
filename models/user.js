const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  login: { type: String, required: true },
  password: { type: String, required: true },
  status: {
    type: String,
    enum: ['new', 'member', 'admin'],
    default: 'new',
  },
});

module.exports = mongoose.model('User', userSchema);
