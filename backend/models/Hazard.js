const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'] },
  comment: { type: String },
  updatedBy: { type: String },
  imageUrl: { type: String }
}, { timestamps: { createdAt: 'updatedAt', updatedAt: false } });

const hazardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Roads', 'Garbage', 'Water', 'Electricity', 'Public Health', 'Others'], 
    default: 'Others' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'], 
    default: 'Pending' 
  },
  location: { type: String, default: '' },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
  reportedBy: { type: String, required: true },
  reportedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: String }],
  updates: [updateSchema],
  assignedTo: { type: String, default: '' },
  expectedResolutionDate: { type: String, default: '' }
}, { timestamps: true });

// Virtual to map _id to id for frontend compatibility
hazardSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    ret.reportedAt = ret.createdAt;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Hazard', hazardSchema);
