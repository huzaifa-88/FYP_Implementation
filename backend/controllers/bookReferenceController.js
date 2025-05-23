const pool = require('../utils/db');
const sql = require('mssql');

// Get all book references
async function getAllBookReferences(req, res) {
  try {
    const result = await pool.request().query('SELECT * FROM bookreference');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching book references:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get a book reference by ID
async function getBookReferenceById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM bookreference WHERE bookreference_id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Book reference not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching book reference by ID:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Create a new book reference
async function createBookReference(req, res) {
    const { bookname, bookauthor } = req.body;
  
    // Basic validation
    if (!bookname || !bookauthor || bookname.trim() === '' || bookauthor.trim() === '') {
      return res.status(400).json({ error: 'Book name and author are required' });
    }
  
    try {
      // Check for duplicate entry
      const checkResult = await pool
        .request()
        .input('bookname', sql.VarChar(500), bookname.trim())
        .input('bookauthor', sql.VarChar(500), bookauthor.trim())
        .query('SELECT * FROM bookreference WHERE bookname = @bookname AND bookauthor = @bookauthor');
  
      if (checkResult.recordset.length > 0) {
        return res.status(409).json({ error: 'This book reference already exists' });
      }
  
      // Insert new book reference
      await pool
        .request()
        .input('bookname', sql.VarChar(500), bookname.trim())
        .input('bookauthor', sql.VarChar(500), bookauthor.trim())
        .query('INSERT INTO bookreference (bookname, bookauthor) VALUES (@bookname, @bookauthor)');
  
      res.status(201).json({ message: 'Book reference added successfully' });
    } catch (err) {
      console.error('Error adding book reference:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  

// Update a book reference
async function updateBookReference(req, res) {
  const { id } = req.params;
  const { bookname, bookauthor } = req.body;
  try {
    await pool
      .request()
      .input('id', sql.Int, id)
      .input('bookname', sql.VarChar(500), bookname)
      .input('bookauthor', sql.VarChar(500), bookauthor)
      .query(
        'UPDATE bookreference SET bookname = @bookname, bookauthor = @bookauthor WHERE bookreference_id = @id'
      );

    res.status(200).json({ message: 'Book reference updated successfully' });
  } catch (err) {
    console.error('Error updating book reference:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Delete a book reference
async function deleteBookReference(req, res) {
    const { id } = req.params;
    try {
      const result = await pool
        .request()
        .input('id', sql.Int, id)
        .query('DELETE FROM bookreference WHERE bookreference_id = @id');
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'Book reference not found or already deleted' });
      }
  
      res.status(200).json({ message: 'Book reference deleted successfully' });
    } catch (err) {
      console.error('Error deleting book reference:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  

module.exports = {
  getAllBookReferences,
  getBookReferenceById,
  createBookReference,
  updateBookReference,
  deleteBookReference,
};
