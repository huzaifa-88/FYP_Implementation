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

const pool = new sql.ConnectionPool(Config);

pool.connect()
    .then(() => {
        console.log('Connected to SQL Server (Windows Auth)');
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });

module.exports = pool;
