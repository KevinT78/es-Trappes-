const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['carte bancaire', 'chèque', 'espèces', 'virement', 'Pass Sport', 'Chèque sport'],
    required: true
  },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed'], default: 'completed' }
});

const memberSchema = new mongoose.Schema({
  licenseNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['M', 'F'], required: true },
  age: { type: Number, required: true },
  category: {
    type: String,
    enum: [
      'Seniors', 'SeniorsF', 'Veterans',
      'U20M', 'U19M', 'U19F', 'U20F',
      'U18M', 'U17M', 'U18F', 'U17F',
      'U16M', 'U16F', 'U15M', 'U15F',
      'U14M', 'U14F', 'U13M', 'U13F',
      'U12M', 'U12F', 'U11M', 'U11F',
      'U10M', 'U10F', 'U9M', 'U9F',
      'U8M', 'U8F', 'U7M', 'U7F', 'U6M', 'U6F'
    ],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'partial'],
    default: 'unpaid'
  },
  paymentHistory: [paymentHistorySchema],
  totalPaid: { type: Number, default: 0 },
  totalDue: { type: Number, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Member', memberSchema);