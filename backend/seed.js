/**
 * Seed Script — Populates MongoDB with realistic demo issues
 * 
 * Usage:  node seed.js
 * 
 * This will:
 *  1. Find existing users or create two demo users (Shreyash & Atharva)
 *  2. Clear existing hazards
 *  3. Insert 14 realistic civic issues with category-appropriate Unsplash images
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const Hazard = require('./models/Hazard');
const User = require('./models/User');

const SEED_USERS = [
  {
    name: 'Shreyash Olambe',
    email: 'shreyash@example.com',
    password: 'password123',
    role: 'user',
    phone: '+91 98765 43210',
    address: 'Miraj, Sangli'
  },
  {
    name: 'Atharva Sanganwar',
    email: 'atharva@example.com',
    password: 'password123',
    role: 'user',
    phone: '+91 98765 43211',
    address: 'Vishrambagh, Sangli'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // 1. Find or create seed users
    const users = {};
    for (const u of SEED_USERS) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        const hashed = await bcrypt.hash(u.password, 10);
        existing = await User.create({ ...u, password: hashed });
        console.log(`✓ Created user: ${u.name}`);
      } else {
        console.log(`✓ Found existing user: ${u.name}`);
      }
      users[u.name] = existing;
    }

    const shreyash = users['Shreyash Olambe'];
    const atharva = users['Atharva Sanganwar'];

    // 2. Clear existing hazards
    const deleted = await Hazard.deleteMany({});
    console.log(`✓ Cleared ${deleted.deletedCount} existing hazards`);

    // 3. Seed issues
    const now = new Date();
    const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

    const issues = [
      {
        title: 'Large Pothole on Miraj Road',
        description: 'There is a very deep pothole near the Miraj Railway Station entrance causing danger to two-wheelers, especially at night. The pothole is approximately 2 feet wide and 6 inches deep. Multiple accidents have been reported.',
        category: 'Roads',
        status: 'In Progress',
        priority: 'High',
        location: 'Miraj Road, Near Railway Station, Sangli',
        lat: 16.8524, lng: 74.5815,
        reportedBy: shreyash.name,
        reportedByUserId: shreyash._id,
        upvotes: 45,
        upvotedBy: [shreyash._id.toString(), atharva._id.toString()],
        imageUrl: 'https://images.unsplash.com/photo-1599408248295-7b071f86cdee?auto=format&fit=crop&q=80&w=800',
        assignedTo: 'Road Maintenance Department',
        expectedResolutionDate: daysAgo(-3),
        updates: [
          { status: 'In Progress', comment: 'Site inspection completed. Repair crew scheduled for tomorrow morning at 6 AM.', updatedBy: 'Mayur More' },
          { status: 'Pending', comment: 'Report received and verified. Forwarded to Road Maintenance Department.', updatedBy: 'System' }
        ]
      },
      {
        title: 'Garbage Pileup in Vishrambagh',
        description: 'Waste collection has not happened for 3 consecutive days near the college area. The smell is becoming unbearable and creating health hazards. Approximately 5-6 large piles of garbage.',
        category: 'Garbage',
        status: 'Pending',
        priority: 'Critical',
        location: 'Vishrambagh, Near Willingdon College, Sangli',
        lat: 16.8450, lng: 74.6050,
        reportedBy: atharva.name,
        reportedByUserId: atharva._id,
        upvotes: 32,
        upvotedBy: [atharva._id.toString()],
        imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800',
        assignedTo: 'Sanitation Department'
      },
      {
        title: 'Streetlight Not Working',
        description: 'The entire block near Rajapeth is in complete darkness. All 8 streetlights are non-functional. Major safety concern for residents, especially women and children.',
        category: 'Electricity',
        status: 'Resolved',
        priority: 'High',
        location: 'Rajapeth, Amravati',
        lat: 20.9320, lng: 77.7523,
        reportedBy: shreyash.name,
        reportedByUserId: shreyash._id,
        upvotes: 28,
        upvotedBy: [shreyash._id.toString()],
        imageUrl: 'https://images.unsplash.com/photo-1517347671033-f0f4383bb8a2?auto=format&fit=crop&q=80&w=800',
        updates: [
          { status: 'Resolved', comment: 'All bulbs replaced and wiring checked. Lights are now fully functional.', updatedBy: 'Mayur More', imageUrl: 'https://images.unsplash.com/photo-1513828742073-8cf0e1a4fa50?auto=format&fit=crop&q=80&w=800' }
        ]
      },
      {
        title: 'Water Leakage from Main Pipe',
        description: 'Massive water leakage from the main supply pipe near the overhead tank. Estimated 1000+ liters of clean water being wasted daily. Road is flooded.',
        category: 'Water',
        status: 'Pending',
        priority: 'Critical',
        location: 'CIDCO, Near Water Tank, Nanded',
        lat: 19.1429, lng: 77.3039,
        reportedBy: shreyash.name,
        reportedByUserId: shreyash._id,
        upvotes: 67,
        upvotedBy: [shreyash._id.toString(), atharva._id.toString()],
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
        assignedTo: 'Water Supply Department'
      },
      {
        title: 'Illegal Construction on Footpath',
        description: 'A permanent structure is being constructed on the public footpath near Ganpati Temple, completely blocking pedestrian movement.',
        category: 'Others',
        status: 'Pending',
        priority: 'Medium',
        location: 'Ganpati Temple Area, Market Road, Sangli',
        lat: 16.8550, lng: 74.5850,
        reportedBy: shreyash.name,
        reportedByUserId: shreyash._id,
        upvotes: 15,
        upvotedBy: [shreyash._id.toString()],
        imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800',
        assignedTo: 'Building Permission Department'
      },
      {
        title: 'Open Manhole Cover Missing',
        description: 'Extremely dangerous open manhole in the middle of the main market area. No warning signs or barriers. High risk of fatal accidents.',
        category: 'Roads',
        status: 'In Progress',
        priority: 'Critical',
        location: 'Main Market, Miraj',
        lat: 16.8200, lng: 74.6500,
        reportedBy: atharva.name,
        reportedByUserId: atharva._id,
        upvotes: 120,
        upvotedBy: [shreyash._id.toString(), atharva._id.toString()],
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800',
        assignedTo: 'Municipal Corporation',
        expectedResolutionDate: daysAgo(-2),
        updates: [
          { status: 'In Progress', comment: 'Emergency barricades placed around the manhole. Permanent cover installation within 48 hours.', updatedBy: 'Mayur More' }
        ]
      },
      {
        title: 'Broken Drainage Pipe',
        description: 'Sewage water overflowing on the main road near the bus stand. Creating severe health hazard and foul smell.',
        category: 'Public Health',
        status: 'Pending',
        priority: 'High',
        location: 'Bus Stand Area, Sangli',
        lat: 16.8580, lng: 74.5880,
        reportedBy: shreyash.name,
        reportedByUserId: shreyash._id,
        upvotes: 34,
        upvotedBy: [shreyash._id.toString()],
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800',
        assignedTo: 'Drainage Department'
      },
      {
        title: 'Low Voltage Issues',
        description: 'Persistent low voltage problem in the entire area for the past week. Voltage drops to 180V. Electronic appliances at high risk of damage.',
        category: 'Electricity',
        status: 'Pending',
        priority: 'Medium',
        location: 'Shaniwar Peth, Miraj',
        lat: 16.8250, lng: 74.6450,
        reportedBy: atharva.name,
        reportedByUserId: atharva._id,
        upvotes: 18,
        upvotedBy: [atharva._id.toString()],
        imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800',
        assignedTo: 'Electricity Board'
      },
      {
        title: 'Stray Dog Menace',
        description: 'Pack of 15-20 aggressive stray dogs near the public park. Multiple incidents of children being chased.',
        category: 'Public Health',
        status: 'Pending',
        priority: 'High',
        location: 'Vazirabad, Near City Park, Nanded',
        lat: 19.1550, lng: 77.3150,
        reportedBy: shreyash.name,
        reportedByUserId: shreyash._id,
        upvotes: 52,
        upvotedBy: [shreyash._id.toString(), atharva._id.toString()],
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=800',
        assignedTo: 'Animal Control Department'
      },
      {
        title: 'Water Supply Timing Issue',
        description: 'Water supply scheduled for 6-8 AM not arriving. Residents have to wake up early but no water. Issue persisting for 2 weeks.',
        category: 'Water',
        status: 'Pending',
        priority: 'Medium',
        location: 'Rajarampuri, Kolhapur',
        lat: 16.7050, lng: 74.2433,
        reportedBy: atharva.name,
        reportedByUserId: atharva._id,
        upvotes: 23,
        upvotedBy: [atharva._id.toString()],
        imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=800',
        assignedTo: 'Water Supply Department'
      },
      {
        title: 'Broken Divider on Highway',
        description: 'The concrete divider on the main highway near Amravati bypass is broken. Vehicles are taking illegal U-turns, creating a high risk of head-on collisions.',
        category: 'Roads',
        status: 'Pending',
        priority: 'Critical',
        location: 'Bypass Road, Amravati',
        lat: 20.9500, lng: 77.7800,
        reportedBy: atharva.name,
        reportedByUserId: atharva._id,
        upvotes: 89,
        upvotedBy: [shreyash._id.toString(), atharva._id.toString()],
        imageUrl: 'https://images.unsplash.com/photo-1545179605-1296651e9c43?auto=format&fit=crop&q=80&w=800',
        assignedTo: 'National Highways Authority'
      },
      {
        title: 'Overflowing Dustbins near Market',
        description: 'The large community dustbins in the main market area are overflowing. Garbage is spilling onto the road.',
        category: 'Garbage',
        status: 'In Progress',
        priority: 'Medium',
        location: 'Main Market, Nanded',
        lat: 19.1500, lng: 77.3100,
        reportedBy: shreyash.name,
        reportedByUserId: shreyash._id,
        upvotes: 41,
        upvotedBy: [shreyash._id.toString()],
        imageUrl: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&q=80&w=800',
        assignedTo: 'Municipal Corporation',
        updates: [
          { status: 'In Progress', comment: 'Garbage truck dispatched. Expected cleanup by 2 PM today.', updatedBy: 'Mayur More' }
        ]
      },
      {
        title: 'Low Hanging Power Lines',
        description: 'Electric wires are hanging dangerously low near the entrance of the public school. High risk of electrocution during monsoon.',
        category: 'Electricity',
        status: 'Pending',
        priority: 'Critical',
        location: 'School Area, Vishrambagh, Sangli',
        lat: 16.8480, lng: 74.6080,
        reportedBy: atharva.name,
        reportedByUserId: atharva._id,
        upvotes: 156,
        upvotedBy: [shreyash._id.toString(), atharva._id.toString()],
        imageUrl: 'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?auto=format&fit=crop&q=80&w=800',
        assignedTo: 'MSBTE'
      },
      {
        title: 'Contaminated Water Supply',
        description: 'Water supplied this morning was muddy and had a foul smell. Multiple residents in the building are reporting stomach issues.',
        category: 'Water',
        status: 'Pending',
        priority: 'Critical',
        location: 'Rajarampuri, Kolhapur',
        lat: 16.7080, lng: 74.2450,
        reportedBy: shreyash.name,
        reportedByUserId: shreyash._id,
        upvotes: 210,
        upvotedBy: [shreyash._id.toString(), atharva._id.toString()],
        imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=800',
        assignedTo: 'Health & Water Department'
      }
    ];

    const result = await Hazard.insertMany(issues);
    console.log(`✓ Seeded ${result.length} issues into MongoDB`);

    console.log('\n✅ Seed complete! You can now log in with:');
    console.log('   Email: shreyash@example.com  |  Password: password123');
    console.log('   Email: atharva@example.com   |  Password: password123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
