  const sql = require('mssql');
const pool = require('../utils/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');




// Controller for creating a new user
const createUser = async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    
    // Create a new user using the model
    const newUser = await User.create({
      username,
      password,
      email,
      role
    });
    
    // Respond with the newly created user
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

// Login Controller
// Function to find user by email
async function findUserByEmail(email) {
  try {
    const connection = await pool; // Get the connection pool

    const result = await connection.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');
    
    return result.recordset[0]; // return the first result (user)
  } catch (err) {
    console.error('Error querying user by email:', err);
    throw err; // Re-throw the error for further handling
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.status(200).json({ 
      message: 'Login successful', 
      token: token 
    });
  } catch (err) {
    console.log("Error here.......");
    res.status(500).json({ error: `Internal Server Error ${err}` });
  }
}


// Without Token Implement
// async function loginUser(req, res) {
//   try {
//     const { email, password } = req.body;
    
//     // Find the user by email
//     const user = await findUserByEmail(email);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Compare the password directly since it's stored as plain text
//     if (password !== user.password) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     // Generate a token for the user
//     // const token = generateToken(user);

//     // Respond with success message and token
//     res.status(200).json({ message: 'Login successful'});
//   } catch (err) {
//     res.status(500).json({ error: `Internal Server Error ${err.message}` });
//   }
// }

// Controller for getting all users
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll(); // Get all users from the database
    res.status(200).json(users); // Return all users
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get users', error: error.message });
  }
};

// Controller for getting a single user by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByPk(userId); // Find user by primary key (userid)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user); // Return the user details
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
};

// Controller for updating a user's details
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, password, email, role } = req.body;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update the user details
    await user.update({
      username,
      password,
      email,
      role
    });

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

// Controller for deleting a user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy(); // Delete the user

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};


// Exporting the controller functions
module.exports = {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
