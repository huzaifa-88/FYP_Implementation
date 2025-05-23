const mongoose = require('mongoose');

const singleDrugFormulationSchema = new mongoose.Schema({
  originalname: String,
  botanicalname: String,
  botanicalname_urdu: String,
  vernacularnames: [String],
  temperament: [String],
  source: String,
  actions: [String],
  uses: [String],
  bookreference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'bookReference'
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('SingleDrugFormulation', singleDrugFormulationSchema);
