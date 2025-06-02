const sql = require('mssql');
const dbConfig = require('../utils/db');
const bcrypt = require('bcryptjs');

// Apply for Practitioner
exports.apply = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password, // Will only use this if creating a new user
    city,
    country,
    postalCode,
    role,
    registration_number
  } = req.body;

  try {
    const pool = await dbConfig.connect();

    // Check if user already exists
    const userResult = await pool.request()
      .input('email', sql.VarChar(500), email)
      .query('SELECT * FROM users WHERE email = @email');

    let userId;

    if (userResult.recordset.length > 0) {
      // ✅ Existing user
      userId = userResult.recordset[0].userid;

      // Check if already applied
      const existingApp = await pool.request()
        .input('userid', sql.Int, userId)
        .query('SELECT * FROM practitioner_applications WHERE userid = @userid');

      if (existingApp.recordset.length > 0) {
        return res.status(400).json({ message: 'Application already submitted.' });
      }
    } else {
      // ✅ New user — must validate and hash password
      if (!firstname || !lastname || !email || !password || !role || !registration_number) {
        return res.status(400).json({ message: 'Required user fields missing.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertUserResult = await pool.request()
        .input('firstname', sql.VarChar(500), firstname)
        .input('lastname', sql.VarChar(500), lastname)
        .input('email', sql.VarChar(500), email)
        .input('password', sql.VarChar(500), hashedPassword)
        .input('role', sql.VarChar(500), role)
        .input('city', sql.VarChar(500), city || null)
        .input('country', sql.VarChar(500), country || null)
        .input('postalCode', sql.VarChar(500), postalCode || null)
        .query(`
          INSERT INTO users (firstname, lastname, email, password, UserRole, city, country, postalCode)
          OUTPUT INSERTED.userid
          VALUES (@firstname, @lastname, @email, @password, @role, @city, @country, @postalCode)
        `);

      userId = insertUserResult.recordset[0].userid;
    }

    // Insert into practitioner_applications
    await pool.request()
      .input('userid', sql.Int, userId)
      .input('registration_number', sql.VarChar(100), registration_number || null)
      .query(`
        INSERT INTO practitioner_applications (userid, registration_number)
        VALUES (@userid, @registration_number)
      `);

    res.status(201).json({ message: 'Application submitted successfully.' });
  } catch (err) {
    console.error('Apply Error:', err);
    res.status(500).json({ message: 'Server error while submitting application.' });
  }
};



// exports.apply = async (req, res) => {
//   const {
//     firstname,
//     lastname,
//     email,
//     password,
//     city,
//     country,
//     postalCode,
//     role,
//     registration_number
//   } = req.body;

//   try {
//     const pool = await dbConfig.connect();

//     // Check if user already exists
//     const userResult = await pool.request()
//       .input('email', sql.VarChar(500), email)
//       .query('SELECT * FROM users WHERE email = @email');

//     let userId;

//     if (userResult.recordset.length > 0) {
//       // User already exists
//       userId = userResult.recordset[0].userid;

//       // Check if already applied
//       const existingApp = await pool.request()
//         .input('userid', sql.Int, userId)
//         .query('SELECT * FROM practitioner_applications WHERE userid = @userid');

//       if (existingApp.recordset.length > 0) {
//         return res.status(400).json({ message: 'Application already submitted.' });
//       }
//     } else {
//       // New user — validate required fields
//       if (!firstname || !lastname || !email || !password || !role || !registration_number) {
//         return res.status(400).json({ message: 'Required user fields missing.' });
//       }

//       const hashedPassword = await bcrypt.hash(password, 10);

//       // Insert user
//       const insertUserResult = await pool.request()
//         .input('firstname', sql.VarChar(500), firstname)
//         .input('lastname', sql.VarChar(500), lastname)
//         .input('email', sql.VarChar(500), email)
//         .input('password', sql.VarChar(500), hashedPassword)
//         .input('role', sql.VarChar(500), role)
//         .input('city', sql.VarChar(500), city || null)
//         .input('country', sql.VarChar(500), country || null)
//         .input('postalCode', sql.VarChar(500), postalCode || null)
//         .query(`
//           INSERT INTO users (firstname, lastname, email, password, UserRole, city, country, postalCode)
//           OUTPUT INSERTED.userid
//           VALUES (@firstname, @lastname, @email, @password, @role, @city, @country, @postalCode)
//         `);

//       userId = insertUserResult.recordset[0].userid;
//     }

//     // Now insert into practitioner_applications
//     await pool.request()
//       .input('userid', sql.Int, userId)
//       .input('registration_number', sql.VarChar(100), registration_number || null)
//       .query(`
//         INSERT INTO practitioner_applications (userid, registration_number)
//         VALUES (@userid, @registration_number)
//       `);

//     res.status(201).json({ message: 'Application submitted successfully.' });
//   } catch (err) {
//     console.error('Apply Error:', err);
//     res.status(500).json({ message: 'Server error while submitting application.' });
//   }
// }

// Get all practitioner applications (admin use)
exports.getAllApplications = async (req, res) => {
  try {
    // Reuse the existing pool connection
    const pool = await dbConfig;
    const result = await pool.request().query(`
      SELECT pa.*, u.firstname, u.lastname, u.email, u.city, u.country, u.postalCode
      FROM practitioner_applications pa
      JOIN users u ON pa.userid = u.userid
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Get All Applications Error:', err);
    res.status(500).json({ message: 'Server error while fetching applications.' });
  }
};


// exports.updateStatus = async (req, res) => {
//   const { id } = req.params; // application id
//   const {
//     status,
//     registration_number,
//     firstname,
//     lastname,
//     email,
//     city,
//     country,
//     postalCode
//   } = req.body;

//   if (!['Approved', 'Rejected'].includes(status)) {
//     return res.status(400).json({ message: 'Invalid status value.' });
//   }

//   try {
//     const pool = await dbConfig.connect();

//     // First, get the associated user ID from the application
//     const appResult = await pool.request()
//       .input('id', sql.Int, id)
//       .query(`SELECT userid FROM practitioner_applications WHERE id = @id`);

//     if (appResult.recordset.length === 0) {
//       return res.status(404).json({ message: 'Application not found.' });
//     }

//     const userId = appResult.recordset[0].userid;

//     // Optionally update user fields if provided
//     if (firstname || lastname || email || city || country || postalCode) {
//       await pool.request()
//         .input('userid', sql.Int, userId)
//         .input('firstname', sql.VarChar(500), firstname || null)
//         .input('lastname', sql.VarChar(500), lastname || null)
//         .input('email', sql.VarChar(500), email || null)
//         .input('city', sql.VarChar(500), city || null)
//         .input('country', sql.VarChar(500), country || null)
//         .input('postalCode', sql.VarChar(500), postalCode || null)
//         .query(`
//           UPDATE users
//           SET firstname = ISNULL(@firstname, firstname),
//               lastname = ISNULL(@lastname, lastname),
//               email = ISNULL(@email, email),
//               city = ISNULL(@city, city),
//               country = ISNULL(@country, country),
//               postalCode = ISNULL(@postalCode, postalCode)
//           WHERE userid = @userid
//         `);
//     }

//     // Update application status and registration number
//     await pool.request()
//       .input('id', sql.Int, id)
//       .input('status', sql.VarChar(20), status)
//       .input('registration_number', sql.VarChar(100), registration_number || null)
//       .query(`
//         UPDATE practitioner_applications
//         SET status = @status,
//             registration_number = @registration_number
//         WHERE id = @id
//       `);

//     res.json({ message: `Application ${status.toLowerCase()} successfully.` });
//   } catch (err) {
//     console.error('Update Status Error:', err);
//     res.status(500).json({ message: 'Server error while updating status.' });
//   }
// };



// Update application status (approve/reject)
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const { status, registration_number } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    // Reuse the existing pool connection
    const pool = dbConfig;
    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.VarChar(20), status)
      // .input('registration_number', sql.VarChar(100), registration_number || null)
      .query(`
        UPDATE practitioner_applications
        SET status = @status
        WHERE id = @id
      `);

    res.json({ message: `Application ${status.toLowerCase()} successfully.` });
  } catch (err) {
    console.error('Update Status Error:', err);
    res.status(500).json({ message: 'Server error while updating status.' });
  }
};

// Get application of a specific user
exports.getUserApplication = async (req, res) => {
  const { userid } = req.params;

  try {
    // Reuse the existing pool connection
    const pool = dbConfig;
    const result = await pool.request()
      .input('userid', sql.Int, userid)
      .query(`
        SELECT pa.*, u.firstname, u.lastname, u.email
        FROM practitioner_applications pa
        JOIN users u ON pa.userid = u.userid
        WHERE pa.userid = @userid
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No application found.' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Get User Application Error:', err);
    res.status(500).json({ message: 'Server error while fetching application.' });
  }
};

exports.editApplication = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    city,
    country,
    postalCode,
    registration_number
  } = req.body || {};

  const { id } = req.params; // This is still needed to fetch the application by ID

  try {
    const pool = await dbConfig.connect();

    // Get existing application and related user info using application id
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT pa.*, u.firstname, u.lastname, u.email, u.city, u.country, u.postalCode, u.userid
        FROM practitioner_applications pa
        JOIN users u ON pa.userid = u.userid
        WHERE pa.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const existing = result.recordset[0];
    const userId = existing.userid[0];

    if (!userId || isNaN(userId)) {
      console.log("Debug UserID:", userId);
      return res.status(400).json({ message: 'Invalid or missing user ID.' });
    }

    // Update user table based on userid
    await pool.request()
      .input('userid', sql.Int, userId)
      .input('firstname', sql.VarChar(500), firstname || existing.firstname)
      .input('lastname', sql.VarChar(500), lastname || existing.lastname)
      .input('email', sql.VarChar(500), email || existing.email)
      .input('city', sql.VarChar(500), city || existing.city)
      .input('country', sql.VarChar(500), country || existing.country)
      .input('postalCode', sql.VarChar(500), postalCode || existing.postalCode)
      .query(`
        UPDATE users SET
          firstname = @firstname,
          lastname = @lastname,
          email = @email,
          city = @city,
          country = @country,
          postalCode = @postalCode
        WHERE userid = @userid
      `);

    // Update registration number in practitioner_applications based on userid
    await pool.request()
      .input('userid', sql.Int, userId)
      .input('registration_number', sql.VarChar(100), registration_number || existing.registration_number)
      .query(`
        UPDATE practitioner_applications
        SET registration_number = @registration_number
        WHERE userid = @userid
      `);

    res.json({ message: 'Application updated successfully.' });
  } catch (err) {
    console.error('Edit Application Error:', err);
    res.status(500).json({ message: 'Server error while updating application.' });
  }
};

