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
    .then(async () => {
        console.log('Connected to SQL Server (Windows Auth)');
        // Check if ChatBot user exists
        const result = await pool.request()
          .query(`SELECT COUNT(*) AS count FROM users WHERE userid = 999`);

        if (result.recordset[0].count === 0) {
          // Insert bot user
          await pool.request()
            .query(`
              SET IDENTITY_INSERT users ON;
              INSERT INTO users (userid, firstname, password)
              VALUES (999, 'ChatBot', 999);
              SET IDENTITY_INSERT users OFF;
            `);

          console.log("Inserted ChatBot user");
        }
    })
    
    .catch(err => {
        console.error('Database connection failed:', err);
    });

module.exports = pool;
