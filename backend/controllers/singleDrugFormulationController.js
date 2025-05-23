const pool = require('../utils/db');
const sql = require('mssql');
const { parseVernacularNames } = require('../middleware/parseVernacularNames');
const { parseUsesActions } = require('../middleware/parseUsesActions');

// Get all single drug formulations
exports.getAllSingleDrugFormulations = async (req, res) => {
  try {
    const connection = await pool.connect();
    const result = await connection.request().query(
      `SELECT 
        sdf.drugid,
        sdf.originalname,
        sdf.botanicalname,
        sdf.botanicalname_urdu,
        sdf.vernacularname,

        t.typename AS temperament,
        s.sourcename AS part_used,
        a.actionname AS action,
        u.usesdescription AS uses,
        br.bookname,
        br.bookauthor,
        us.email AS username

      FROM 
        singledrugformulations sdf
        LEFT JOIN temperament t ON sdf.temperamentid = t.temperamentid
        LEFT JOIN source s ON sdf.sourceid = s.sourceid
        LEFT JOIN actions a ON sdf.actionid = a.actionid
        LEFT JOIN uses u ON sdf.usesid = u.usesid
        LEFT JOIN bookreference br ON sdf.bookreference_id = br.bookreference_id
        LEFT JOIN users us ON sdf.userid = us.userid;
      `
    );
    connection.release();
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching single drug formulations:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get single drug formulation by ID
exports.getSingleDrugFormulationById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.connect();

    const result = await connection.request()
      .input('id', sql.Int, id)
      .query(
        `SELECT 
          sdf.drugid,
          sdf.originalname,
          sdf.botanicalname,
          sdf.botanicalname_urdu,
          sdf.vernacularname,
          t.typename AS temperament,
          s.sourcename AS part_used,
          a.actionname AS action,
          u.usesdescription AS uses,
          br.bookname,
          br.bookauthor,
          us.email AS username
        FROM 
          singledrugformulations sdf
        LEFT JOIN temperament t ON sdf.temperamentid = t.temperamentid
        LEFT JOIN source s ON sdf.sourceid = s.sourceid
        LEFT JOIN action a ON sdf.actionid = a.actionid
        LEFT JOIN uses u ON sdf.usesid = u.usesid
        LEFT JOIN bookreference br ON sdf.bookreference_id = br.bookreference_id
        LEFT JOIN users us ON sdf.userid = us.userid
        WHERE sdf.drugid = @id`
      );

    connection.release();

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Drug not found' });
    }

    const drug = result.recordset[0];

    // 🟢 Replace `vernacularname` with parsed version
    drug.vernacularname = parseVernacularNames(drug.vernacularname);
    drug.uses = parseUsesActions(drug.uses);  // Parse uses
    drug.action = parseUsesActions(drug.action);  // Parse actions

    return res.status(200).json(drug);

  } catch (err) {
    console.error('Error fetching drug by ID:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Add a new single drug formulation
exports.addSingleDrugFormulation = async (req, res) => {
  try {
    const {
      originalname,
      botanicalname,
      botanicalname_urdu,
      vernacularname_id,
      temperamentid,
      sourceid,
      actionid,
      usesid,
      bookreference_id,
      userid
    } = req.body;

    const connection = await pool.connect();
    await connection.request()
      .input('originalname', sql.VarChar(500), originalname)
      .input('botanicalname', sql.VarChar(500), botanicalname)
      .input('botanicalname_urdu', sql.NVarChar(500), botanicalname_urdu)
      .input('vernacularname_id', sql.Int, vernacularname_id)
      .input('temperamentid', sql.Int, temperamentid)
      .input('sourceid', sql.Int, sourceid)
      .input('actionid', sql.Int, actionid)
      .input('usesid', sql.Int, usesid)
      .input('bookreference_id', sql.Int, bookreference_id)
      .input('userid', sql.Int, userid)
      .query(`
        INSERT INTO singledrugformulations (
          originalname, botanicalname, botanicalname_urdu,
          vernacularname_id, temperamentid, sourceid,
          actionid, usesid, bookreference_id, userid
        )
        VALUES (
          @originalname, @botanicalname, @botanicalname_urdu,
          @vernacularname_id, @temperamentid, @sourceid,
          @actionid, @usesid, @bookreference_id, @userid
        )
      `);

    connection.release();
    res.status(201).json({ message: 'Single drug formulation added successfully' });
  } catch (err) {
    console.error('Error adding drug formulation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a single drug formulation
exports.deleteSingleDrugFormulation = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.connect();
    await connection.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM singledrugformulations WHERE drugid = @id');

    connection.release();
    res.status(200).json({ message: 'Single drug formulation deleted successfully' });
  } catch (err) {
    console.error('Error deleting drug formulation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};