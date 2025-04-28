const express = require('express');
const sql = require('mssql');
const db = require('./utils/db');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const compoundDrugFormulationRoutes = require('./routes/compoundDrugFormulationRoutes');

const app = express();
const port = 3005;

app.use(cors({
    origin: 'http://localhost:3005',
    optionsSuccessStatus: 200
}));
app.use(express.json()); // good practice for APIs


app.use('/api', userRoutes);
app.use('/api', compoundDrugFormulationRoutes);
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

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
