/**
 * Public contact form endpoint — no authentication required.
 * Embed this in any website contact form:
 *   POST /api/contact  { name, email, phone, company, source, message }
 */
const express = require('express');
const Lead = require('../models/Lead');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, source, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const lead = await Lead.create({
      name,
      email,
      phone:   phone   || '',
      company: company || '',
      source:  source  || 'website',
      message: message || '',
    });

    res.status(201).json({ message: 'Thank you! We will be in touch soon.', id: lead._id });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
