const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    addedBy: {
      type: String,
      default: 'Admin',
    },
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      enum: ['website', 'referral', 'social_media', 'email', 'other'],
      default: 'website',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
      default: 'new',
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    notes: [noteSchema],
    assignedTo: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Text index for search
leadSchema.index({ name: 'text', email: 'text', company: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
