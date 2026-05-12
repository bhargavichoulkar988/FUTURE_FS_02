const express = require('express');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All lead routes require authentication
router.use(protect);

// GET /api/leads — list all leads with optional search & filter
router.get('/', async (req, res) => {
  try {
    const { status, source, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      leads,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/leads/analytics — summary stats
router.get('/analytics', async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const byStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const bySource = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);

    // Leads created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCount = await Lead.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.json({ total, byStatus, bySource, recentCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/leads/:id — single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/leads — create a new lead (also used by public contact forms)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, source, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const lead = await Lead.create({ name, email, phone, company, source, message });
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/leads/:id — update status, assignedTo, etc.
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['status', 'assignedTo', 'phone', 'company', 'source'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const lead = await Lead.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/leads/:id/notes — add a follow-up note
router.post('/:id/notes', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Note text is required' });

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.notes.push({ text, addedBy: req.user.name });
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/leads/:id/notes/:noteId — remove a note
router.delete('/:id/notes/:noteId', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.notes = lead.notes.filter(
      (n) => n._id.toString() !== req.params.noteId
    );
    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/leads/:id — delete a lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
