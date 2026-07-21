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
    default: 'Unclassified' 
  },
  userCategory: { type: String, default: '' },
  aiTags: [{ type: String }],
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
  locationName: { type: String, default: '' },
  locationGeo: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
  reportedBy: { type: String, required: true },
  reportedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: String }],
  updates: [updateSchema],
  assignedTo: { type: String, default: '' },
  expectedResolutionDate: { type: String, default: '' },
  
  // NEW ML-ENHANCED FIELDS
  mlCategory: { type: String, default: '' },  // AI-suggested category
  mlPriority: { type: String, default: '' },  // AI-suggested priority
  mlConfidence: { type: Number, default: 0 }, // Confidence score
  urgencyScore: { type: Number, default: 0 }, // Dynamic urgency (0-100)
  clusterSize: { type: Number, default: 0 },  // Number of similar reports
  clusterId: { type: String, default: '' },   // Cluster identifier
  duplicateOf: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hazard' }],  // Related issues
  
}, { timestamps: true });

hazardSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    ret.reportedAt = ret.createdAt;
    delete ret.__v;
    return ret;
  }
});

hazardSchema.index({ locationGeo: '2dsphere' });

module.exports = mongoose.model('Hazard', hazardSchema);
