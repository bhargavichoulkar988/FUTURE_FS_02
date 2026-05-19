/**
 * Seed script — creates a default admin user and sample leads.
 * Run once:  node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Lead = require('./models/Lead');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-crm';

const SAMPLE_LEADS = [
  { name: 'Alice Johnson',  email: 'alice@example.com',  phone: '+1 555 100 0001', company: 'TechCorp',    source: 'website',      status: 'new',       message: 'Interested in your enterprise plan.' },
  { name: 'Bob Martinez',   email: 'bob@example.com',    phone: '+1 555 100 0002', company: 'StartupXYZ',  source: 'referral',     status: 'contacted', message: 'Referred by Alice.' },
  { name: 'Carol White',    email: 'carol@example.com',  phone: '+1 555 100 0003', company: 'DesignHub',   source: 'social_media', status: 'qualified', message: 'Saw our Instagram post.' },
  { name: 'David Lee',      email: 'david@example.com',  phone: '+1 555 100 0004', company: 'FinanceInc',  source: 'email',        status: 'converted', message: 'Ready to sign contract.' },
  { name: 'Eva Brown',      email: 'eva@example.com',    phone: '+1 555 100 0005', company: '',            source: 'website',      status: 'lost',      message: 'Budget constraints.' },
  { name: 'Frank Wilson',   email: 'frank@example.com',  phone: '',                company: 'MediaGroup',  source: 'referral',     status: 'new',       message: '' },
  { name: 'Grace Kim',      email: 'grace@example.com',  phone: '+1 555 100 0007', company: 'EduTech',     source: 'website',      status: 'contacted', message: 'Wants a demo.' },
  { name: 'Henry Davis',    email: 'henry@example.com',  phone: '+1 555 100 0008', company: 'RetailPlus',  source: 'social_media', status: 'new',       message: 'Found us on LinkedIn.' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Admin user
  const existing = await User.findOne({ email: 'admin@minicrm.com' });
  if (!existing) {
    await User.create({ name: 'Admin', email: 'admin@minicrm.com', password: 'admin123' });
    console.log('Admin created  →  admin@minicrm.com / admin123');
  } else {
    console.log('Admin already exists');
  }

  // Sample leads
  const count = await Lead.countDocuments();
  if (count === 0) {
    await Lead.insertMany(SAMPLE_LEADS);
    console.log(`${SAMPLE_LEADS.length} sample leads inserted`);
  } else {
    console.log(`Leads already exist (${count}), skipping`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => { console.error(err); process.exit(1); });
