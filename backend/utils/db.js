// config/db.js
const sql = require('mssql');

const Config = {
    user: 'tks',
    password: '1234',
    database: 'FYP_Unani',
    server: 'HUZAIFA-PC\\SQLEXPRESS',
    options: {
      encrypt: true, // or false, depending on your SQL Server config
      trustServerCertificate: true,
      trustedConnection: false,
      enableArithAbort: true,
      instancename: "SQLEXPRESS"
    },
    port:1433
  };

// const config = {
//     server: 'HUZAIFA-PC\\SQLEXPRESS',
//     database: 'KBS_Unani', // Replace with your DB name
//     options: {
//         trustedConnection: true,
//         trustServerCertificate: true,
//         connectTimeout: 30000
//     },
//     authentication: {
//         type: 'ntlm',
//         options: {
//             domain: 'HUZAIFA-PC',
//             userName: 'PMYLS',
//             password: '', // Leave empty for Windows Auth
//         }
//     }
// };

const pool = new sql.ConnectionPool(Config);

pool.connect()
    .then(() => {
        console.log('Connected to SQL Server (Windows Auth)');
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });

module.exports = pool;
