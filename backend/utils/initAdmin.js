//--------------SQL Admin creation
const pool = require('./db');
const sql = require('mssql');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = 'admin@unani.com';
const ADMIN_PASSWORD = 'Admin@123'; // Strong default password
const ADMIN_ROLE = 'admin';

async function createAdminUser() {
  try {
    const connection = await pool.connect();

    // Check if admin already exists
    const checkResult = await connection.request()
      .input('email', sql.VarChar, ADMIN_EMAIL)
      .query('SELECT * FROM users WHERE email = @email');

    if (checkResult.recordset.length > 0) {
      console.log('✅ Admin user already exists');
      connection.release();
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Insert admin user
    await connection.request()
      .input('firstname', sql.VarChar, 'Admin')
      .input('lastname', sql.VarChar, 'User')
      .input('email', sql.VarChar, ADMIN_EMAIL)
      .input('password', sql.VarChar, hashedPassword)
      .input('UserRole', sql.VarChar, ADMIN_ROLE)
      .input('city', sql.VarChar, 'Lahore')
      .input('country', sql.VarChar, 'Pakistan')
      .input('postalCode', sql.VarChar, '54000')
      .query(`
        INSERT INTO users (firstname, lastname, email, password, UserRole, city, country, postalCode)
        VALUES (@firstname, @lastname, @email, @password, @UserRole, @city, @country, @postalCode)
      `);

    console.log('🚀 Admin user created successfully');
    connection.release();
  } catch (err) {
    console.error('❌ Error creating admin user:', err.message);
  }
}

module.exports = createAdminUser;






//--------------MongoDb Code
// const bcrypt = require('bcryptjs');
// const User = require('../models/userModel');

// const createAdminUser = async () => {
//   try {
//     const existingAdmin = await User.findOne({ email: 'admin@unani.com' });
//     if (existingAdmin) {
//       console.log('Admin user already exists');
//       return;
//     }

//     const hashedPassword = await bcrypt.hash('admin123', 10);

//     const adminUser = new User({
//       firstname: 'Admin',
//       lastname: 'User',
//       email: 'admin@unani.com',
//       password: hashedPassword,
//       UserRole: 'admin',
//       city: 'DefaultCity',
//       country: 'DefaultCountry',
//       postalCode: '00000'
//     });

//     await adminUser.save();
//     console.log('✅ Admin user created');
//   } catch (err) {
//     console.error('❌ Error creating admin user:', err.message);
//   }
// };

// module.exports = { createAdminUser };
