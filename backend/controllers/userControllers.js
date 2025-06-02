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

// Controller for getting all users
const getUsers = async (req, res) => {
  try {
    const request = await pool.request();
    const result = await request.query('SELECT * FROM users'); // Get all users

    res.status(200).json(result.recordset); // Send all users as JSON
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to get users', error: error.message });
  }
};



// GET /api/users/checkPractitioner/:userid
const checkPractitioner = async (req, res) => {
  const userid = req.params.userid;
  try {
    const request = await pool.request();
    const result = await request
      .input('userid', sql.Int, userid)
      .query('SELECT COUNT(*) AS count FROM practitioner_applications WHERE userid = @userid');

    res.json({ isPractitioner: result.recordset[0].count > 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to check practitioner status', error: error.message });
  }
};

// DELETE /api/practitioner_applications/deleteByUser/:userid
const deletePractitionerApplicationsByUser = async (req, res) => {
  const userid = req.params.userid;
  try {
    await pool.request()
      .input('userid', sql.Int, userid)
      .query('DELETE FROM practitioner_applications WHERE userid = @userid');

    res.json({ message: 'Practitioner applications deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete practitioner applications', error: error.message });
  }
};



// Controller for getting a single user by ID
const getUserById = async (req, res) => {
  const userId = req.params.userid;

  try {
    const request = await pool.request(); // Use the imported pool directly
    const result = await request
      .input('userid', sql.Int, userId)
      .query('SELECT * FROM users WHERE userid = @userid');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
};


// Controller for updating a user's details
const updateUser = async (req, res) => {
  try {
    const userId = req.params.userid;
    const { firstname, lastname, email, password, UserRole, city, country, postalCode } = req.body;

    // Fetch existing user first
    const request = await pool.request();
    const existingUserResult = await request
      .input('userid', sql.Int, userId)
      .query('SELECT * FROM users WHERE userid = @userid');

    if (existingUserResult.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingUser = existingUserResult.recordset[0];

    // Merge existing values with incoming (keep old if not provided)
    const updatedFirstname = firstname || existingUser.firstname;
    const updatedLastname = lastname || existingUser.lastname;
    const updatedEmail = email || existingUser.email;
    const updatedUserRole = UserRole || existingUser.UserRole;
    const updatedCity = city || existingUser.city;
    const updatedCountry = country || existingUser.country;
    const updatedPostalCode = postalCode || existingUser.postalCode;

    // Hash password only if provided, else keep existing
    let updatedPassword = existingUser.password;
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    // Prepare update query
    const updateQuery = `
      UPDATE users
      SET
        firstname = @firstname,
        lastname = @lastname,
        email = @email,
        password = @password,
        UserRole = @UserRole,
        city = @city,
        country = @country,
        postalCode = @postalCode
      WHERE userid = @userid
    `;

    const updateRequest = await pool.request()
      .input('firstname', sql.VarChar(500), updatedFirstname)
      .input('lastname', sql.VarChar(500), updatedLastname)
      .input('email', sql.VarChar(500), updatedEmail)
      .input('password', sql.VarChar(500), updatedPassword)
      .input('UserRole', sql.VarChar(500), updatedUserRole)
      .input('city', sql.VarChar(500), updatedCity)
      .input('country', sql.VarChar(500), updatedCountry)
      .input('postalCode', sql.VarChar(500), updatedPostalCode)
      .input('userid', sql.Int, userId);

    await updateRequest.query(updateQuery);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};


// DELETE /api/users/deleteUserByID/:userid
const deleteUser = async (req, res) => {
  const userid = req.params.userid;
  try {
    await pool.request()
      .input('userid', sql.Int, userid)
      .query('DELETE FROM users WHERE userid = @userid');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};


// Controller for deleting a user
// const deleteUser = async (req, res) => {
//   try {
//     const userId = req.params.userid;

//     const request = await pool.request();

//     // Check if user exists
//     const userCheck = await request
//       .input('userid', sql.Int, userId)
//       .query('SELECT * FROM users WHERE userid = @userid');

//     if (userCheck.recordset.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Delete the user
//     await pool.request()
//       .input('userid', sql.Int, userId)
//       .query('DELETE FROM users WHERE userid = @userid');

//     res.status(200).json({ message: 'User deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     res.status(500).json({ message: 'Failed to delete user', error: error.message });
//   }
// };


// Exporting the controller functions
module.exports = {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  checkPractitioner,
  deletePractitionerApplicationsByUser
};
