//// MongoDB Database
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');

// // Import MongoDB connection
// require('./utils/mongoDB');

// const userRoutes = require('./routes/userRoutes');
// const { createAdminUser } = require('./utils/initAdmin');
// const singleDrugFormulationRoutes = require('./routes/singleDrugFormulationRoutes');
// // const compoundDrugFormulationRoutes = require('./routes/compoundDrugFormulationRoutes');
// // const bookReferenceRoutes = require('./routes/bookReferenceRoutes');

// const app = express();
// const port = process.env.PORT || 3005;

// // Middleware
// app.use(cors({
//     origin: 'http://localhost:3000', // adjust if frontend is hosted elsewhere
//     optionsSuccessStatus: 200
// }));

// app.use(express.json());

// // API Routes
// app.use('/api/users', userRoutes);
// // app.use('/api/compound-drugs', compoundDrugFormulationRoutes);
// app.use('/api/single-drugs', singleDrugFormulationRoutes);
// // app.use('/api/book-references', bookReferenceRoutes);

// // Test route
// app.get('/', (req, res) => {
//     res.send('Hello from Unani Formulations API with MongoDB!');
// });

// // Start server
// createAdminUser().then(() => {
//     app.listen(port, () => {
//         console.log(`Server is running on http://localhost:${port}`);
//     });
// });



// -----------FOR SQL DB
const express = require('express');
const sql = require('mssql');
const db = require('./utils/db');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const compoundDrugFormulationRoutes = require('./routes/compoundDrugFormulationRoutes');
const singleDrugFormulationRoutes = require('./routes/singleDrugFormulationRoutes');
const bookReferenceRoutes = require('./routes/bookReferenceRoutes');
const createAdminUser = require('./utils/initAdmin');
const practitioner_applications = require('./routes/practitionerRoutes');
const chatRoutes = require('./routes/chatRoutes')


const app = express();
const port = 3005;

app.use(cors({
    origin: 'http://localhost:8080',
    optionsSuccessStatus: 200,
    credentials: true
}));
// app.use(express.json()); // good practice for APIs
app.use(express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      res.status(400).json({ message: 'Malformed JSON' });
      throw new Error('Invalid JSON body');
    }
  }
}));


app.use('/api', userRoutes);
app.use('/api', compoundDrugFormulationRoutes);
app.use('/api', singleDrugFormulationRoutes);
app.use('/api', bookReferenceRoutes);
app.use('/api', practitioner_applications);
app.use('/api', chatRoutes);
// Test route with DB query
app.get('/users', async (req, res) => {
    try {
        const request = new sql.Request(db);
        const result = await request.query('SELECT * FROM users'); // Replace with your table name
        res.json(result.recordset);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Database query failed');
    }
});

app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.listen(3005, async () => {
  console.log('Server is listening on port 3005');
  await createAdminUser(); // Automatically creates admin if not exists
});
