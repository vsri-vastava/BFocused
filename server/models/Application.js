
const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    location: { type: String, default: '' },
    type: { type: String, default: 'Internship' },

    status: {
      type: String,
      enum: ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
    },

    appliedDate: { type: String, default: '' },
    deadline: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Application', applicationSchema)
