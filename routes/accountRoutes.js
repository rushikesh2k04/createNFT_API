const express = require('express');
const router = express.Router();
const pool = require('../db');
const { algosdk } = require('../algorand/client');

// POST: Create Account
router.post('/create-account', async (req, res) => {
  const { name, email, occupation } = req.body;
  if (!name || !email || !occupation) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const check = await pool.query('SELECT * FROM accounts WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const account = algosdk.generateAccount();
    const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

    await pool.query(
      'INSERT INTO accounts (name, email, occupation, address, mnemonic) VALUES ($1, $2, $3, $4, $5)',
      [name, email, occupation, account.addr, mnemonic]
    );

    res.json({
      message: 'Account created successfully',
      address: account.addr,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: List all accounts
router.get('/accounts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, occupation, address, mnemonic, created_at FROM accounts'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
