// const { Sequelize, DataTypes } = require('sequelize');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // Update the connection configuration with your credentials
// const sequelize = new Sequelize('KBS_Unani', 'tks', '1234', {
//   host: 'localhost',
//   dialect: 'mssql',  // MSSQL dialect for SQL Server
//   logging: false,    // Set to true if you want to see SQL logs
//   dialectOptions: {
//     encrypt: true,
//     trustServerCertificate: true,
//   },
// });

// // Define the User model (This is just a reference to the existing table)
// const User = sequelize.define('User', {
//   userid: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   firstname: {
//     type: DataTypes.STRING(50),
//     allowNull: true,
//   },
//   lastname: {
//     type: DataTypes.STRING(50),
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING(100),
//     allowNull: true,
//   },
//   password: {
//     type: DataTypes.STRING(100),
//     allowNull: false,
//   },
//   UserRole: {
//     type: DataTypes.STRING(50),
//     allowNull: true,
//   },
//   city: {
//     type: DataTypes.STRING(50),
//     allowNull: true,
//   },
//   country: {
//     type: DataTypes.STRING(50),
//     allowNull: true,
//   },
//   postalCode: {
//     type: DataTypes.STRING(50),
//     allowNull: true,
//   }
// }, {
//   tableName: 'users',  // Ensure this matches the table name in your DB
//   timestamps: false,   // No createdAt/updatedAt columns
// });

// // Hash password before saving to database
// User.beforeCreate(async (user) => {
//   if (user.password) {
//     user.password = await bcrypt.hash(user.password, 10);
//   }
// });

// User.beforeUpdate(async (user) => {
//   if (user.password) {
//     user.password = await bcrypt.hash(user.password, 10);
//   }
// });

// module.exports = User;


// // const { Sequelize, DataTypes } = require('sequelize');
// // const bcrypt = require('bcryptjs'); 

// // // Update the connection configuration with your credentials
// // const sequelize = new Sequelize('KBS_Unani', 'HUZAIFA-PC\\PMYLS', '', {
// //   host: 'localhost',
// //   dialect: 'mssql',  // MSSQL dialect for SQL Server
// //   logging: false,  // Set to true for SQL logging
// //   dialectOptions: {
// //     encrypt: true,  // Enable encryption if needed
// //     trustServerCertificate: true, // Skip certificate validation in development
// //   },
// // });

// // // Define the User model
// // const User = sequelize.define('User', {
// //   userid: {
// //     type: DataTypes.INTEGER,
// //     primaryKey: true,
// //     autoIncrement: true,  // Auto-increment for the primary key
// //   },
// //   username: {
// //     type: DataTypes.STRING(50),
// //     allowNull: false,  // Username is required
// //   },
// //   password: {
// //     type: DataTypes.STRING(100),
// //     allowNull: false,  // Password is required
// //   },
// //   email: {
// //     type: DataTypes.STRING(100),
// //     allowNull: true,  // Email is optional
// //   },
// //   role: {
// //     type: DataTypes.STRING(50),
// //     allowNull: true,  // Role is optional
// //   }
// // }, {
// //   tableName: 'users',  // Table name in your database
// //   timestamps: false,  // No timestamps like createdAt/updatedAt
// // });

// // // Hash password before saving to database
// // User.beforeCreate(async (user) => {
// //     if (user.password) {
// //       user.password = await bcrypt.hash(user.password, 10); // 10 is the salt rounds
// //     }
// // });

// // User.beforeUpdate(async (user) => {
// // if (user.password) {
// //     user.password = await bcrypt.hash(user.password, 10); // Hash password before update
// // }
// // });

// // // Sync the model to the database
// // sequelize.sync()
// //   .then(() => console.log('User model synced'))
// //   .catch((error) => console.error('Error syncing model:', error));

// // module.exports = User;


