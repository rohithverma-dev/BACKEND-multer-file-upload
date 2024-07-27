const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  resume_name: String,
  profile_name: String,
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);