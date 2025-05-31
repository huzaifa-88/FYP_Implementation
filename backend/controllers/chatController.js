const axios = require('axios');
const pool = require('../utils/db');

// Handle chat message, create thread if needed, save user and bot messages
const handleChat = async (req, res) => {
  const { thread_id, message } = req.body;
  const user_id = req.user.userid;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let validThreadId = thread_id;

    // Create thread if not provided
    if (!thread_id) {
      const insertThreadResult = await pool
        .request()
        .input('userid', user_id)
        .query(`
          INSERT INTO threads (userid)
          OUTPUT INSERTED.thread_id
          VALUES (@userid)
        `);
      validThreadId = insertThreadResult.recordset[0].thread_id;
    } else {
      // Validate thread belongs to user
      const threadCheck = await pool
        .request()
        .input('thread_id', thread_id)
        .input('userid', user_id)
        .query(`
          SELECT * FROM threads WHERE thread_id = @thread_id AND userid = @userid
        `);
      if (threadCheck.recordset.length === 0) {
        return res.status(400).json({ error: 'Invalid or unauthorized thread ID' });
      }
    }

    // Insert user message
    await pool
      .request()
      .input('thread_id', validThreadId)
      .input('userid', user_id)
      .input('message', message)
      .query(`
        INSERT INTO UserCHAT (thread_id, userid, message, is_bot)
        VALUES (@thread_id, @userid, @message, 0)
      `);

    // Call FastAPI chatbot
    const response = await axios.post('http://127.0.0.1:8000/chat', {
      user_id: user_id.toString(),
      thread_id: validThreadId.toString(),
      message,
    });

    const botReply = response.data?.message;

    if (botReply) {
      await pool
        .request()
        .input('thread_id', validThreadId)
        .input('userid', 999) // your bot user id (make sure this user exists in users table)
        .input('message', botReply)
        .query(`
          INSERT INTO UserCHAT (thread_id, userid, message, is_bot)
          VALUES (@thread_id, @userid, @message, 1)
        `);
    }

    res.json({
      thread_id: validThreadId,
      ...response.data,
    });
  } catch (err) {
    console.error('Chat handler error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all threads for logged-in user
const getThreads = async (req, res) => {
  const user_id = req.user.userid;

  try {
    const result = await pool
      .request()
      .input('userid', user_id)
      .query(`
        SELECT thread_id, userid, created_at
        FROM threads
        WHERE userid = @userid
        ORDER BY created_at DESC
      `);

    res.json({ threads: result.recordset });
  } catch (err) {
    console.error('Error fetching threads:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single thread by ID for logged-in user
const getThreadById = async (req, res) => {
  const user_id = req.user.userid;
  const thread_id = parseInt(req.params.id, 10);

  if (isNaN(thread_id)) {
    return res.status(400).json({ error: 'Invalid thread ID' });
  }

  try {
    const threadResult = await pool
      .request()
      .input('thread_id', thread_id)
      .input('userid', user_id)
      .query(`
        SELECT thread_id, userid, created_at
        FROM threads
        WHERE thread_id = @thread_id AND userid = @userid
      `);

    if (threadResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Thread not found or unauthorized' });
    }

    // Optional: fetch messages of this thread
    const messagesResult = await pool
      .request()
      .input('thread_id', thread_id)
      .query(`
        SELECT chat_id, thread_id, userid, message, is_bot, created_at
        FROM UserCHAT
        WHERE thread_id = @thread_id
        ORDER BY created_at ASC
      `);

    res.json({
      thread: threadResult.recordset[0],
      messages: messagesResult.recordset,
    });
  } catch (err) {
    console.error('Error fetching thread by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  handleChat,
  getThreads,
  getThreadById,
};
