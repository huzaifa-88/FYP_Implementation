const pool = require('../utils/db'); // assuming you have a db.js for your DB connection
const sql = require('mssql');  // This should be at the top of your file
const { parseSteps } = require('../middleware/parser'); // adjust path if needed
const { parseUsesActions } = require('../middleware/parseUsesActions');
const { parseCommas } = require('../middleware/parseCommas');
const { cleanResponseObject } = require('../utils/cleanTextFields');

// Add a new compound drug formulation
async function addCompoundDrugFormulation(req, res) {
  try {
    const { description, chiefingredient, dosequantityid, preparation, actionid, usesid, singledrugformid, userid } = req.body;

    // Basic validation
    if (!description || !chiefingredient || !dosequantityid || !preparation || !actionid || !usesid || !singledrugformid || !userid) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
      INSERT INTO compounddrugformulation (description, chiefingredient, dosequantityid, preparation, actionid, usesid, singledrugformid, userid)
      VALUES (@description, @chiefingredient, @dosequantityid, @preparation, @actionid, @usesid, @singledrugformid, @userid);
    `;

    const poolConnection = await pool.connect();
    await poolConnection.request()
      .input('description', pool.NVarChar, description)
      .input('chiefingredient', pool.NVarChar, chiefingredient)
      .input('dosequantityid', pool.Int, dosequantityid)
      .input('preparation', pool.NVarChar, preparation)
      .input('actionid', pool.Int, actionid)
      .input('usesid', pool.Int, usesid)
      .input('singledrugformid', pool.Int, singledrugformid)
      .input('userid', pool.Int, userid)
      .query(query);

    poolConnection.release();
    res.status(201).json({ message: 'Compound drug formulation added successfully' });
  } catch (err) {
    console.error('Error adding compound drug formulation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get all compound drug formulations
async function getAllCompoundDrugFormulations(req, res) {
  try {
    const query = 'SELECT * FROM compounddrugformulation';
    const poolConnection = await pool.connect();
    const result = await poolConnection.request().query(query);
    
    poolConnection.release();
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error retrieving compound drug formulations:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getCompoundDrugFormulationById(req, res) {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        c.compounddrugid,
        c.compounddrugname,
        c.description,
        c.chiefingredient,
        c.Ingredients,
        c.preparation,
        a.actionname AS action,
        u.usesdescription AS uses,
        d.dose AS dose_quantity,
        b.bookname AS book_reference,
        us.email AS username
      FROM compounddrugformulation c
      LEFT JOIN action a ON c.actionid = a.actionid
      LEFT JOIN uses u ON c.usesid = u.usesid
      LEFT JOIN dosequantity d ON c.dosequantityid = d.dosequantityid
      LEFT JOIN bookreference b ON c.bookreference_id = b.bookreference_id
      LEFT JOIN users us ON c.userid = us.userid
      WHERE c.compounddrugid = @id
    `;

    const poolConnection = await pool.connect();
    const result = await poolConnection.request()
      .input('id', sql.Int, id)
      .query(query);
    poolConnection.release();

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Compound Drug Formulation not found' });
    }

    const record = result.recordset[0];

    // Parse the preparation instructions
    record.preparation_steps = parseSteps(record.preparation);
    record.ingredients = parseUsesActions(record.Ingredients);
    record.actions_list = parseCommas(record.action);
    record.uses_list = parseCommas(record.uses);

    const cleanRecord = cleanResponseObject(record);

    res.status(200).json(cleanRecord);
  } catch (err) {
    console.error('Error retrieving compound drug formulation by ID:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


// // Get a compound drug formulation by ID and Without Parser, I was using this function before
// async function getCompoundDrugFormulationById(req, res) {
//   try {
//     const { id } = req.params;  // Ensure you're passing the ID in the request params
//     const query = 
//     `SELECT 
//         c.compounddrugid,
//         c.compounddrugname,
//         c.description,
//         c.chiefingredient,
//         c.Ingredients,
//         c.preparation,
        
//         a.actionname AS action,
//         u.usesdescription AS uses,
//         d.dose AS dose_quantity,
//         b.bookname AS book_reference,
//         us.email AS username

//         FROM 
//             compounddrugformulation c
//         LEFT JOIN 
//             action a ON c.actionid = a.actionid
//         LEFT JOIN 
//             uses u ON c.usesid = u.usesid
//         LEFT JOIN 
//             dosequantity d ON c.dosequantityid = d.dosequantityid
//         LEFT JOIN 
//             bookreference b ON c.bookreference_id = b.bookreference_id
//         LEFT JOIN 
//             users us ON c.userid = us.userid

//         WHERE 
//             c.compounddrugid = @id
//         `;

//     // Ensure pool is correctly connected and the `sql` object is available
//     const poolConnection = await pool.connect();

//     // Input method should be called like this
//     const result = await poolConnection.request()
//       .input('id', sql.Int, id)  // Correct input format: 'id', sql.Int, id
//       .query(query);

//     poolConnection.release();

//     if (result.recordset.length === 0) {
//       return res.status(404).json({ error: 'Compound Drug Formulation not found' });
//     }

//     res.status(200).json(result.recordset[0]);
//   } catch (err) {
//     console.error('Error retrieving compound drug formulation by ID:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }


// Update a compound drug formulation
async function updateCompoundDrugFormulation(req, res) {
  try {
    const { id } = req.params;
    const { description, chiefingredient, dosequantityid, preparation, actionid, usesid, singledrugformid, userid } = req.body;

    if (!description || !chiefingredient || !dosequantityid || !preparation || !actionid || !usesid || !singledrugformid || !userid) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
      UPDATE compounddrugformulation
      SET description = @description, chiefingredient = @chiefingredient, dosequantityid = @dosequantityid, preparation = @preparation, 
          actionid = @actionid, usesid = @usesid, singledrugformid = @singledrugformid, userid = @userid
      WHERE compounddrugid = @id;
    `;
    const poolConnection = await pool.connect();
    await poolConnection.request()
      .input('id', pool.Int, id)
      .input('description', pool.NVarChar, description)
      .input('chiefingredient', pool.NVarChar, chiefingredient)
      .input('dosequantityid', pool.Int, dosequantityid)
      .input('preparation', pool.NVarChar, preparation)
      .input('actionid', pool.Int, actionid)
      .input('usesid', pool.Int, usesid)
      .input('singledrugformid', pool.Int, singledrugformid)
      .input('userid', pool.Int, userid)
      .query(query);
    
    poolConnection.release();
    res.status(200).json({ message: 'Compound drug formulation updated successfully' });
  } catch (err) {
    console.error('Error updating compound drug formulation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Delete a compound drug formulation
async function deleteCompoundDrugFormulation(req, res) {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM compounddrugformulation WHERE compounddrugid = @id';
    const poolConnection = await pool.connect();
    const result = await poolConnection.request()
      .input('id', sql.Int, id)
      .query(query);

    poolConnection.release();

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Compound drug formulation not found' });
    }

    res.status(200).json({ message: 'Compound drug formulation deleted successfully' });
  } catch (err) {
    console.error('Error deleting compound drug formulation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  addCompoundDrugFormulation,
  getAllCompoundDrugFormulations,
  getCompoundDrugFormulationById,
  updateCompoundDrugFormulation,
  deleteCompoundDrugFormulation,
};
