const SingleDrugFormulation = require('../models/singleDrugFormulationsModel');
const BookReference = require('../models/bookReferenceModel'); // Import BookReference model
const User = require('../models/userModel'); // Assuming you have the User model

// Get all single drug formulations
exports.getAllSingleDrugFormulations = async (req, res) => {
  try {
    const formulations = await SingleDrugFormulation.find()
      .populate('bookreference') // Populating book reference
      .populate('userid'); // Populating user data if needed
    res.status(200).json(formulations);
  } catch (err) {
    console.error('Error fetching all drug formulations:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get single drug formulation by ID
exports.getSingleDrugFormulationById = async (req, res) => {
  try {
    const { id } = req.params;
    const drug = await SingleDrugFormulation.findById(id)
      .populate('bookreference') // Populating book reference
      .populate('userid'); // Populating user data if needed

    if (!drug) {
      return res.status(404).json({ message: 'Drug formulation not found' });
    }

    res.status(200).json(drug);
  } catch (err) {
    console.error('Error fetching drug formulation by ID:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Add a new single drug formulation
exports.addSingleDrugFormulation = async (req, res) => {
  try {
    const {
      originalname,
      botanicalname,
      botanicalname_urdu,
      vernacularnames,
      temperament,
      source,
      actions,
      uses,
      bookreferenceTitle,
      bookreferenceAuthor,
      bookreferenceYear,
      userid
    } = req.body;

    // Check if the book reference already exists
    let bookReference = await BookReference.findOne({
      title: bookreferenceTitle,
      author: bookreferenceAuthor,
      publicationYear: bookreferenceYear
    });

    // If the book reference doesn't exist, create it
    if (!bookReference) {
      bookReference = new BookReference({
        title: bookreferenceTitle,
        author: bookreferenceAuthor,
        publicationYear: bookreferenceYear
      });
      await bookReference.save();
    }

    const newDrug = new SingleDrugFormulation({
      originalname,
      botanicalname,
      botanicalname_urdu,
      vernacularnames, // Should be an array of strings
      temperament,     // Should be an array of strings
      source,          // Simple string e.g., "Leaves"
      actions,         // Array of strings
      uses,            // Array of strings
      bookreference: bookReference._id, // Store reference to BookReference
      userid           // Reference to User (if needed)
    });

    await newDrug.save();
    res.status(201).json({ message: 'Single drug formulation added successfully', data: newDrug });
  } catch (err) {
    console.error('Error adding drug formulation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a single drug formulation
exports.deleteSingleDrugFormulation = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the drug formulation
    const drug = await SingleDrugFormulation.findByIdAndDelete(id);
    if (!drug) {
      return res.status(404).json({ message: 'Drug formulation not found' });
    }

    // Optionally, delete the related book reference if no other drug formulations use it
    const bookReference = await BookReference.findById(drug.bookreference);
    const remainingFormulations = await SingleDrugFormulation.countDocuments({ bookreference: drug.bookreference });

    if (remainingFormulations === 0 && bookReference) {
      await BookReference.findByIdAndDelete(drug.bookreference);
    }

    res.status(200).json({ message: 'Single drug formulation deleted successfully' });
  } catch (err) {
    console.error('Error deleting drug formulation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
