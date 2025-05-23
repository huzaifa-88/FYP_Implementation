const sql = require('mssql');
const pool = require('../utils/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');

// Controller for creating a new user
async function createUser(req, res) {
  try {
    const { firstname, lastname, email, password, city, country, postalCode, role } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: 'Firstname, lastname, email, and password are required.' });
    }

    const userRole = role || 'General User';

    const connection = await pool.connect();

    // Check if user with the same email already exists
    const result = await connection.request()
      .input('email', sql.VarChar(500), email)
      .query(`SELECT * FROM users WHERE email = @email`);

    if (result.recordset.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user with hashed password
    await connection.request()
      .input('firstname', sql.VarChar(500), firstname)
      .input('lastname', sql.VarChar(500), lastname)
      .input('email', sql.VarChar(500), email)
      .input('password', sql.VarChar(500), hashedPassword)
      .input('role', sql.VarChar(500), userRole)
      .input('city', sql.VarChar(500), city || null)
      .input('country', sql.VarChar(500), country || null)
      .input('postalCode', sql.VarChar(500), postalCode || null)
      .query(`
        INSERT INTO users (
          firstname, lastname, email, password, UserRole, city, country, postalCode
        )
        VALUES (
          @firstname, @lastname, @email, @password, @role, @city, @country, @postalCode
        )
      `);

    connection.release();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


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

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      console.log("IsPasswordMatch:", isPasswordMatch);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.status(200).json({ 
      message: 'Login successful', 
      token: token,
      userRole: user.UserRole
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// module.exports = loginUser;



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
