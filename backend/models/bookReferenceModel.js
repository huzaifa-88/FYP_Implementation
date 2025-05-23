const mongoose = require('mongoose');

const bookReferenceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  publicationYear: { type: Number, required: true },
  additionalInfo: String // If you have any extra information like edition, publisher, etc.
}, { timestamps: true });

module.exports = mongoose.model('BookReference', bookReferenceSchema);
