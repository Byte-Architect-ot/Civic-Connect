import { CivicIssue, User, Notification } from './types';

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Shreyash Olambe', 
    role: 'Citizen', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shreyash', 
    email: 'shreyash@example.com', 
    phone: '+91 98765 43210',
    address: 'Miraj, Sangli',
    joinedAt: '2025-01-15T10:00:00Z',
    reportsCount: 12,
    resolvedCount: 8
  },
  { 
    id: 'u2', 
    name: 'Atharva Sanganwar', 
    role: 'Citizen', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Atharva', 
    email: 'atharva@example.com', 
    phone: '+91 98765 43211',
    address: 'Vishrambagh, Sangli',
    joinedAt: '2025-02-10T10:00:00Z',
    reportsCount: 8,
    resolvedCount: 5
  },
  { 
    id: 's1', 
    name: 'Mayur More', 
    role: 'Staff', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mayur', 
    email: 'mayur.d@nagriksetu.gov.in', 
    phone: '+91 98765 43212',
    joinedAt: '2024-11-01T10:00:00Z',
    reportsCount: 0,
    resolvedCount: 45
  },
];

export const MOCK_ISSUES: CivicIssue[] = [
  {
    id: 'i1',
    title: 'Large Pothole on Miraj Road',
    description: 'There is a very deep pothole near the Miraj Railway Station entrance causing danger to two-wheelers, especially at night. The pothole is approximately 2 feet wide and 6 inches deep. Multiple accidents have been reported.',
    category: 'Roads',
    status: 'In Progress',
    priority: 'High',
    location: 'Miraj Road, Near Railway Station, Sangli',
    lat: 16.8524,
    lng: 74.5815,
    reportedBy: 'Shreyash Olambe',
    reportedAt: '2026-04-01T10:30:00Z',
    upvotes: 45,
    upvotedBy: ['u1', 'u2'],
    imageUrl: 'https://images.unsplash.com/photo-1599408248295-7b071f86cdee?auto=format&fit=crop&q=80&w=800',
    assignedTo: 'Road Maintenance Department',
    expectedResolutionDate: '2026-04-10T00:00:00Z',
    updates: [
      {
        id: 'up1',
        status: 'In Progress',
        comment: 'Site inspection completed. Repair crew scheduled for tomorrow morning at 6 AM. Road closure from 6 AM to 12 PM.',
        updatedAt: '2026-04-02T09:00:00Z',
        updatedBy: 'Mayur More'
      },
      {
        id: 'up0',
        status: 'Pending',
        comment: 'Report received and verified. Forwarded to Road Maintenance Department.',
        updatedAt: '2026-04-01T14:00:00Z',
        updatedBy: 'System'
      }
    ]
  },
  {
    id: 'i2',
    title: 'Garbage Pileup in Vishrambagh',
    description: 'Waste collection has not happened for 3 consecutive days near the college area. The smell is becoming unbearable and creating health hazards. Approximately 5-6 large piles of garbage.',
    category: 'Garbage',
    status: 'Pending',
    priority: 'Critical',
    location: 'Vishrambagh, Near Willingdon College, Sangli',
    lat: 16.8450,
    lng: 74.6050,
    reportedBy: 'Atharva Sanganwar',
    reportedAt: '2026-04-03T14:20:00Z',
    upvotes: 32,
    upvotedBy: ['u2'],
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800',
    assignedTo: 'Sanitation Department'
  },
  {
    id: 'i3',
    title: 'Streetlight Not Working',
    description: 'The entire block near Rajapeth is in complete darkness. All 8 streetlights are non-functional. Major safety concern for residents, especially women and children.',
    category: 'Electricity',
    status: 'Resolved',
    priority: 'High',
    location: 'Rajapeth, Amravati',
    lat: 20.9320,
    lng: 77.7523,
    reportedBy: 'Shreyash Olambe',
    reportedAt: '2026-03-28T19:45:00Z',
    upvotes: 28,
    upvotedBy: ['u1'],
    updates: [
      {
        id: 'up2',
        status: 'Resolved',
        comment: 'All bulbs replaced and wiring checked. Lights are now fully functional. Added to regular maintenance schedule.',
        updatedAt: '2026-03-30T11:15:00Z',
        updatedBy: 'Mayur More',
        imageUrl: 'https://images.unsplash.com/photo-1513828742073-8cf0e1a4fa50?auto=format&fit=crop&q=80&w=800'
      }
    ]
  },
  {
    id: 'i4',
    title: 'Water Leakage from Main Pipe',
    description: 'Massive water leakage from the main supply pipe near the overhead tank. Estimated 1000+ liters of clean water being wasted daily. Road is flooded.',
    category: 'Water',
    status: 'Pending',
    priority: 'Critical',
    location: 'CIDCO, Near Water Tank, Nanded',
    lat: 19.1429,
    lng: 77.3039,
    reportedBy: 'Shreyash Olambe',
    reportedAt: '2026-04-05T08:00:00Z',
    upvotes: 67,
    upvotedBy: ['u1', 'u2'],
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    assignedTo: 'Water Supply Department'
  },
  {
    id: 'i5',
    title: 'Illegal Construction on Footpath',
    description: 'A permanent structure is being constructed on the public footpath near Ganpati Temple, completely blocking pedestrian movement. Footpath width reduced by 70%.',
    category: 'Others',
    status: 'Pending',
    priority: 'Medium',
    location: 'Ganpati Temple Area, Market Road, Sangli',
    lat: 16.8550,
    lng: 74.5850,
    reportedBy: 'Shreyash Olambe',
    reportedAt: '2026-04-05T11:00:00Z',
    upvotes: 15,
    upvotedBy: ['u1'],
    assignedTo: 'Building Permission Department'
  },
  {
    id: 'i6',
    title: 'Open Manhole Cover Missing',
    description: 'Extremely dangerous open manhole in the middle of the main market area. No warning signs or barriers. High risk of fatal accidents.',
    category: 'Roads',
    status: 'In Progress',
    priority: 'Critical',
    location: 'Main Market, Miraj',
    lat: 16.8200,
    lng: 74.6500,
    reportedBy: 'Atharva Sanganwar',
    reportedAt: '2026-04-04T09:15:00Z',
    upvotes: 120,
    upvotedBy: ['u1', 'u2'],
    assignedTo: 'Municipal Corporation',
    expectedResolutionDate: '2026-04-06T00:00:00Z',
    updates: [
      {
        id: 'up3',
        status: 'In Progress',
        comment: 'Emergency barricades placed around the manhole. Permanent heavy-duty cover being manufactured and will be installed within 48 hours.',
        updatedAt: '2026-04-04T12:00:00Z',
        updatedBy: 'Mayur More'
      }
    ]
  },
  {
    id: 'i7',
    title: 'Broken Drainage Pipe',
    description: 'Sewage water overflowing on the main road near the bus stand. Creating severe health hazard and foul smell. Affecting nearby shops and pedestrians.',
    category: 'Public Health',
    status: 'Pending',
    priority: 'High',
    location: 'Bus Stand Area, Sangli',
    lat: 16.8580,
    lng: 74.5880,
    reportedBy: 'Shreyash Olambe',
    reportedAt: '2026-04-06T15:30:00Z',
    upvotes: 34,
    upvotedBy: ['u1'],
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800',
    assignedTo: 'Drainage Department'
  },
  {
    id: 'i8',
    title: 'Low Voltage Issues',
    description: 'Persistent low voltage problem in the entire area for the past week. Voltage drops to 180V. Electronic appliances at high risk of damage. Frequent bulb failures.',
    category: 'Electricity',
    status: 'Pending',
    priority: 'Medium',
    location: 'Shaniwar Peth, Miraj',
    lat: 16.8250,
    lng: 74.6450,
    reportedBy: 'Atharva Sanganwar',
    reportedAt: '2026-04-07T11:45:00Z',
    upvotes: 18,
    upvotedBy: ['u2'],
    assignedTo: 'Electricity Board'
  },
  {
    id: 'i9',
    title: 'Stray Dog Menace',
    description: 'Pack of 15-20 aggressive stray dogs near the public park. Multiple incidents of children being chased. Parents afraid to let children play outside.',
    category: 'Public Health',
    status: 'Pending',
    priority: 'High',
    location: 'Vazirabad, Near City Park, Nanded',
    lat: 19.1550,
    lng: 77.3150,
    reportedBy: 'Shreyash Olambe',
    reportedAt: '2026-04-07T16:20:00Z',
    upvotes: 52,
    upvotedBy: ['u1', 'u2'],
    assignedTo: 'Animal Control Department'
  },
  {
    id: 'i10',
    title: 'Water Supply Timing Issue',
    description: 'Water supply scheduled for 6-8 AM not arriving. Residents have to wake up early but no water. Issue persisting for 2 weeks.',
    category: 'Water',
    status: 'Pending',
    priority: 'Medium',
    location: 'Rajarampuri, Kolhapur',
    lat: 16.7050,
    lng: 74.2433,
    reportedBy: 'Atharva Sanganwar',
    reportedAt: '2026-04-08T07:30:00Z',
    upvotes: 23,
    upvotedBy: ['u2'],
    assignedTo: 'Water Supply Department'
  },
  {
    id: 'i11',
    title: 'Broken Divider on Highway',
    description: 'The concrete divider on the main highway near Amravati bypass is broken. Vehicles are taking illegal U-turns, creating a high risk of head-on collisions.',
    category: 'Roads',
    status: 'Pending',
    priority: 'Critical',
    location: 'Bypass Road, Amravati',
    lat: 20.9500,
    lng: 77.7800,
    reportedBy: 'Atharva Sanganwar',
    reportedAt: '2026-04-08T10:00:00Z',
    upvotes: 89,
    upvotedBy: ['u1', 'u2'],
    assignedTo: 'National Highways Authority'
  },
  {
    id: 'i12',
    title: 'Overflowing Dustbins near Market',
    description: 'The large community dustbins in the main market area are overflowing. Garbage is spilling onto the road. Attracting stray animals and creating foul smell.',
    category: 'Garbage',
    status: 'In Progress',
    priority: 'Medium',
    location: 'Main Market, Nanded',
    lat: 19.1500,
    lng: 77.3100,
    reportedBy: 'Shreyash Olambe',
    reportedAt: '2026-04-09T09:30:00Z',
    upvotes: 41,
    upvotedBy: ['u1'],
    assignedTo: 'Municipal Corporation',
    updates: [
      {
        id: 'up4',
        status: 'In Progress',
        comment: 'Garbage truck dispatched. Expected cleanup by 2 PM today.',
        updatedAt: '2026-04-09T11:00:00Z',
        updatedBy: 'Mayur More'
      }
    ]
  },
  {
    id: 'i13',
    title: 'Low Hanging Power Lines',
    description: 'Electric wires are hanging dangerously low near the entrance of the public school. High risk of electrocution during monsoon.',
    category: 'Electricity',
    status: 'Pending',
    priority: 'Critical',
    location: 'School Area, Vishrambagh, Sangli',
    lat: 16.8480,
    lng: 74.6080,
    reportedBy: 'Atharva Sanganwar',
    reportedAt: '2026-04-10T14:00:00Z',
    upvotes: 156,
    upvotedBy: ['u1', 'u2'],
    assignedTo: 'MSBTE'
  },
  {
    id: 'i14',
    title: 'Contaminated Water Supply',
    description: 'Water supplied this morning was muddy and had a foul smell. Multiple residents in the building are reporting stomach issues.',
    category: 'Water',
    status: 'Pending',
    priority: 'Critical',
    location: 'Rajarampuri, Kolhapur',
    lat: 16.7080,
    lng: 74.2450,
    reportedBy: 'Shreyash Olambe',
    reportedAt: '2026-04-11T08:15:00Z',
    upvotes: 210,
    upvotedBy: ['u1', 'u2'],
    assignedTo: 'Health & Water Department'
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Issue Resolved',
    message: 'Your report "Streetlight Not Working" has been successfully resolved by the authorities.',
    type: 'StatusUpdate',
    timestamp: '2026-03-30T11:15:00Z',
    isRead: false,
    issueId: 'i3',
    priority: 'High'
  },
  {
    id: 'n2',
    title: 'New Update',
    message: 'Mayur More added a comment to "Large Pothole on Miraj Road".',
    type: 'StatusUpdate',
    timestamp: '2026-04-02T09:00:00Z',
    isRead: true,
    issueId: 'i1',
    priority: 'Normal'
  },
  {
    id: 'n3',
    title: 'System Maintenance',
    message: 'NagrikSetu will undergo scheduled maintenance on Sunday from 2:00 AM to 4:00 AM IST.',
    type: 'System',
    timestamp: '2026-04-05T10:00:00Z',
    isRead: false,
    priority: 'Normal'
  },
  {
    id: 'n4',
    title: 'High Priority Issue',
    message: 'Your report "Water Leakage from Main Pipe" has been marked as Critical priority.',
    type: 'StatusUpdate',
    timestamp: '2026-04-05T08:30:00Z',
    isRead: false,
    issueId: 'i4',
    priority: 'High'
  },
  {
    id: 'n5',
    title: 'Popular Report',
    message: 'Your report "Open Manhole Cover Missing" has received 100+ upvotes.',
    type: 'Upvote',
    timestamp: '2026-04-06T14:00:00Z',
    isRead: true,
    issueId: 'i6',
    priority: 'Normal'
  }
];