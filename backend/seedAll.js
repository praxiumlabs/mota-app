/**
 * MOTA Database Seed Script
 * Complete data with multiple images per entity
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Lodging = require('./models/Lodging');
const Activity = require('./models/Activity');
const Event = require('./models/Event');
const Nightlife = require('./models/Nightlife');
const ExoticFleet = require('./models/ExoticFleet');
const Content = require('./models/Content');
const FundingRound = require('./models/FundingRound');
const Notification = require('./models/Notification');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/mota';

// ============================================
// USERS
// ============================================
const users = [
  {
    email: 'admin@mota.com',
    password: 'admin123',
    name: 'Admin User',
    phone: '+501-600-0001',
    accessLevel: 'investor',
    investorTier: 'diamond',
    investmentAmount: 75000000,
    portfolioValue: 82500000,
    isActive: true,
    memberSince: new Date('2023-01-01'),
    investorProfile: { kycCompleted: true, accreditedInvestor: true }
  },
  {
    email: 'guest@demo.com',
    password: 'demo123',
    name: 'Guest User',
    phone: '+501-600-0002',
    accessLevel: 'guest',
    isActive: true,
    memberSince: new Date('2024-06-01')
  },
  {
    email: 'member@demo.com',
    password: 'demo123',
    name: 'Sarah Mitchell',
    phone: '+501-600-0003',
    accessLevel: 'member',
    isActive: true,
    memberSince: new Date('2024-01-15')
  },
  {
    email: 'investor@demo.com',
    password: 'demo123',
    name: 'James Rodriguez',
    phone: '+501-600-0004',
    accessLevel: 'investor',
    investorTier: 'gold',
    investmentAmount: 2500000,
    portfolioValue: 2750000,
    isActive: true,
    memberSince: new Date('2023-06-01'),
    investorProfile: { kycCompleted: true, accreditedInvestor: true }
  },
  {
    email: 'platinum@demo.com',
    password: 'demo123',
    name: 'Victoria Chen',
    phone: '+501-600-0005',
    accessLevel: 'investor',
    investorTier: 'platinum',
    investmentAmount: 15000000,
    portfolioValue: 17250000,
    isActive: true,
    memberSince: new Date('2023-03-01'),
    investorProfile: { kycCompleted: true, accreditedInvestor: true }
  },
  {
    email: 'diamond@demo.com',
    password: 'demo123',
    name: 'Alexander Wright',
    phone: '+501-600-0006',
    accessLevel: 'investor',
    investorTier: 'diamond',
    investmentAmount: 70000000,
    portfolioValue: 84000000,
    isActive: true,
    memberSince: new Date('2023-01-15'),
    investorProfile: { kycCompleted: true, accreditedInvestor: true }
  }
];

// ============================================
// RESTAURANTS (Eateries)
// ============================================
const restaurants = [
  {
    name: 'Azure',
    cuisine: 'Mediterranean',
    description: 'Experience the essence of coastal Mediterranean cuisine at Azure, where fresh seafood meets time-honored recipes. Our executive chef crafts dishes using locally-sourced ingredients and imported specialties from Greece, Italy, and Morocco. The stunning oceanfront setting provides the perfect backdrop for an unforgettable dining experience.',
    shortDescription: 'Coastal Mediterranean fine dining',
    images: [
      { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', caption: 'Main dining room', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', caption: 'Ocean view terrace', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Signature seafood platter', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800', caption: 'Fresh Mediterranean salad', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', caption: 'Private dining area', isPrimary: false }
    ],
    priceRange: '$$$$',
    rating: 4.9,
    reviewCount: 234,
    dressCode: 'smart casual',
    reservationRequired: true,
    features: ['Ocean View', 'Private Dining', 'Wine Cellar', 'Outdoor Seating', 'Live Music'],
    hours: '6:00 PM - 11:00 PM',
    phone: '+501-600-1001',
    email: 'azure@motaresort.com',
    location: { building: 'Oceanfront Tower', floor: 1 },
    isAvailable: true,
    isFeatured: true,
    dogFriendly: false,
    kidsFriendly: true
  },
  {
    name: 'Ember & Oak',
    cuisine: 'Steakhouse',
    description: 'Ember & Oak brings the finest cuts of aged beef to your table, prepared over open flames using traditional techniques. Our master grill chefs source premium wagyu and dry-aged steaks from renowned ranches worldwide. Complement your meal with selections from our award-winning wine collection.',
    shortDescription: 'Premium steakhouse & grill',
    images: [
      { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', caption: 'Signature ribeye steak', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800', caption: 'Open flame grill', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', caption: 'Elegant dining room', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800', caption: 'Wine selection', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800', caption: 'Private booth seating', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800', caption: 'Wagyu presentation', isPrimary: false }
    ],
    priceRange: '$$$$',
    rating: 4.8,
    reviewCount: 189,
    dressCode: 'business casual',
    reservationRequired: true,
    features: ['Dry-Aged Beef', 'Wine Cellar', 'Private Dining', 'Cigar Lounge', 'Sommelier Service'],
    hours: '5:30 PM - 11:00 PM',
    phone: '+501-600-1002',
    email: 'emberoak@motaresort.com',
    location: { building: 'Main Resort', floor: 2 },
    isAvailable: true,
    isFeatured: true,
    dogFriendly: false,
    kidsFriendly: true
  },
  {
    name: 'Jade Garden',
    cuisine: 'Pan-Asian',
    description: 'Journey through the flavors of Asia at Jade Garden, where culinary traditions from Japan, Thailand, Vietnam, and China converge. Our dim sum brunches are legendary, and our evening tasting menus showcase the diversity of Asian cuisine. Experience authentic flavors in an elegant setting.',
    shortDescription: 'Authentic Pan-Asian cuisine',
    images: [
      { url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800', caption: 'Restaurant interior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', caption: 'Dim sum selection', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', caption: 'Sushi platter', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800', caption: 'Thai curry dishes', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800', caption: 'Teppanyaki station', isPrimary: false }
    ],
    priceRange: '$$$',
    rating: 4.7,
    reviewCount: 312,
    dressCode: 'smart casual',
    reservationRequired: true,
    features: ['Teppanyaki Tables', 'Sake Bar', 'Private Rooms', 'Dim Sum Brunch', 'Vegetarian Options'],
    hours: '11:30 AM - 10:30 PM',
    phone: '+501-600-1003',
    email: 'jade@motaresort.com',
    location: { building: 'Garden Wing', floor: 1 },
    isAvailable: true,
    isFeatured: true,
    dogFriendly: false,
    kidsFriendly: true
  },
  {
    name: 'La Terraza',
    cuisine: 'Italian',
    description: 'Authentic Italian cuisine crafted with passion and tradition. From handmade pasta to wood-fired pizzas, every dish at La Terraza celebrates the rich culinary heritage of Italy. Our ingredients are imported weekly from trusted Italian suppliers.',
    shortDescription: 'Authentic Italian trattoria',
    images: [
      { url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800', caption: 'Wood-fired pizza oven', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800', caption: 'Fresh pasta making', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800', caption: 'Terrace dining', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', caption: 'Margherita pizza', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800', caption: 'Tiramisu dessert', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', caption: 'Wine cellar', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800', caption: 'Romantic ambiance', isPrimary: false }
    ],
    priceRange: '$$$',
    rating: 4.6,
    reviewCount: 267,
    dressCode: 'casual',
    reservationRequired: false,
    features: ['Wood-Fired Oven', 'Fresh Pasta', 'Italian Wines', 'Outdoor Terrace', 'Family Style'],
    hours: '12:00 PM - 10:00 PM',
    phone: '+501-600-1004',
    email: 'terraza@motaresort.com',
    location: { building: 'Pool Pavilion', floor: 1 },
    isAvailable: true,
    isFeatured: false,
    dogFriendly: true,
    kidsFriendly: true
  },
  {
    name: 'Coral Reef Café',
    cuisine: 'Caribbean Fusion',
    description: 'Casual beachfront dining featuring Caribbean-inspired dishes with a modern twist. Fresh catch of the day, tropical cocktails, and stunning sunset views make this the perfect spot for relaxed dining any time of day.',
    shortDescription: 'Beachfront Caribbean fusion',
    images: [
      { url: 'https://images.unsplash.com/photo-1528150230181-99bbf7b22162?w=800', caption: 'Beachfront setting', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800', caption: 'Fresh seafood', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Grilled fish tacos', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Tropical cocktails', isPrimary: false }
    ],
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 445,
    dressCode: 'casual',
    reservationRequired: false,
    features: ['Beach Access', 'Live Music', 'Happy Hour', 'Kids Menu', 'Sunset Views'],
    hours: '7:00 AM - 10:00 PM',
    phone: '+501-600-1005',
    email: 'coralreef@motaresort.com',
    location: { building: 'Beachfront', floor: 1 },
    isAvailable: true,
    isFeatured: true,
    dogFriendly: true,
    kidsFriendly: true
  }
];

// ============================================
// LODGING
// ============================================
const lodgings = [
  {
    name: 'Presidential Ocean Villa',
    type: 'Villa',
    description: 'The pinnacle of luxury living, our Presidential Ocean Villa offers 8,500 square feet of pure indulgence. Featuring a private infinity pool, personal butler service, and unobstructed ocean views from every room. This three-bedroom masterpiece includes a gourmet kitchen, home theater, and direct beach access.',
    shortDescription: 'Ultimate luxury oceanfront villa',
    images: [
      { url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', caption: 'Villa exterior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', caption: 'Private infinity pool', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', caption: 'Master bedroom', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', caption: 'Living room', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800', caption: 'Gourmet kitchen', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800', caption: 'Ocean view terrace', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', caption: 'Luxury bathroom', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', caption: 'Private beach access', isPrimary: false }
    ],
    price: 12500,
    priceUnit: 'night',
    bedrooms: 3,
    bathrooms: 4,
    maxGuests: 8,
    squareFeet: 8500,
    view: 'ocean',
    amenities: ['Private Pool', 'Butler Service', 'Beach Access', 'Home Theater', 'Gourmet Kitchen', 'Wine Cellar', 'Private Chef Available', 'Spa Bathroom', 'Ocean View', 'Terrace'],
    features: ['24/7 Concierge', 'Airport Transfer', 'Daily Housekeeping', 'Turndown Service'],
    rating: 5.0,
    reviewCount: 47,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'Private Beach', floor: 1 }
  },
  {
    name: 'Overwater Bungalow',
    type: 'Bungalow',
    description: 'Wake up to crystal-clear waters beneath your feet in our stunning overwater bungalow. Glass floor panels reveal the vibrant marine life below, while your private deck offers direct ocean access. Perfect for romantic getaways or those seeking a unique tropical experience.',
    shortDescription: 'Stunning overwater paradise',
    images: [
      { url: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800', caption: 'Bungalow exterior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800', caption: 'Private deck', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Bedroom with ocean view', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', caption: 'Glass floor panels', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=800', caption: 'Outdoor shower', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800', caption: 'Sunset from deck', isPrimary: false }
    ],
    price: 2800,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    squareFeet: 1200,
    view: 'ocean',
    amenities: ['Glass Floor', 'Ocean Access', 'Private Deck', 'Outdoor Shower', 'Mini Bar', 'Room Service', 'Snorkeling Gear', 'Kayaks'],
    features: ['Direct Water Access', 'Couples Spa Treatment', 'Champagne on Arrival'],
    rating: 4.9,
    reviewCount: 156,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'Overwater Pier', floor: 1 }
  },
  {
    name: 'Garden Suite',
    type: 'Suite',
    description: 'Nestled among tropical gardens, our Garden Suite offers a peaceful retreat with modern luxury. The spacious layout features a separate living area, private patio with garden views, and easy access to the resort amenities. Ideal for families or those seeking tranquil surroundings.',
    shortDescription: 'Peaceful garden retreat',
    images: [
      { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', caption: 'Suite interior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', caption: 'King bedroom', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800', caption: 'Garden patio', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800', caption: 'Living area', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', caption: 'Modern bathroom', isPrimary: false }
    ],
    price: 650,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 3,
    squareFeet: 850,
    view: 'garden',
    amenities: ['Garden View', 'Private Patio', 'Mini Bar', 'Room Service', 'Work Desk', 'Complimentary WiFi'],
    features: ['Daily Housekeeping', 'Concierge Service', 'Pool Access'],
    rating: 4.6,
    reviewCount: 289,
    isAvailable: true,
    isFeatured: false,
    location: { building: 'Garden Wing', floor: 1 }
  },
  {
    name: 'Penthouse Suite',
    type: 'Penthouse',
    description: 'Commanding the top floor of our main tower, the Penthouse Suite delivers panoramic views and exceptional luxury. Two bedrooms, a wraparound terrace, private jacuzzi, and dedicated butler service create an unforgettable experience for discerning guests.',
    shortDescription: 'Panoramic top-floor luxury',
    images: [
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', caption: 'Penthouse living room', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', caption: 'Master suite', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', caption: 'Wraparound terrace', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800', caption: 'Private jacuzzi', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800', caption: 'Dining area', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800', caption: 'Panoramic views', isPrimary: false }
    ],
    price: 4500,
    priceUnit: 'night',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    squareFeet: 3200,
    view: 'ocean',
    amenities: ['Private Jacuzzi', 'Butler Service', 'Wraparound Terrace', 'Panoramic Views', 'Premium Bar', 'Espresso Machine', 'Smart Home'],
    features: ['24/7 Butler', 'Private Check-in', 'Luxury Transfers', 'Spa Credits'],
    rating: 4.9,
    reviewCount: 78,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'Main Tower', floor: 15 }
  },
  {
    name: 'Beach Cottage',
    type: 'Cottage',
    description: 'Charming standalone cottage steps from the sand. Featuring tropical décor, a private garden, hammock for two, and beach gear included. The perfect base for beach lovers and water sports enthusiasts.',
    shortDescription: 'Cozy beachside cottage',
    images: [
      { url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800', caption: 'Cottage exterior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', caption: 'Cozy bedroom', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', caption: 'Beach access', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Private garden', isPrimary: false }
    ],
    price: 450,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    squareFeet: 600,
    view: 'beach',
    amenities: ['Beach Access', 'Private Garden', 'Hammock', 'Beach Gear', 'Outdoor Shower', 'Kitchenette'],
    features: ['Daily Beach Setup', 'Snorkel Gear', 'Kayak Access'],
    rating: 4.7,
    reviewCount: 198,
    isAvailable: true,
    isFeatured: false,
    location: { building: 'Beachfront', floor: 1 }
  }
];

// ============================================
// ACTIVITIES (Experiences)
// ============================================
const activities = [
  {
    name: 'Private Yacht Charter',
    category: 'Water Sports',
    description: 'Explore the Caribbean waters aboard your own private yacht. Our experienced captain and crew will take you to hidden coves, pristine snorkeling spots, and secluded beaches. Includes gourmet lunch, premium beverages, and water toys.',
    shortDescription: 'Exclusive private yacht experience',
    images: [
      { url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800', caption: 'Luxury yacht', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', caption: 'Deck views', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', caption: 'Snorkeling stop', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Gourmet lunch', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Hidden cove', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=800', caption: 'Water toys', isPrimary: false }
    ],
    price: 2500,
    duration: '6 hours',
    skillLevel: 'all levels',
    maxParticipants: 12,
    included: ['Captain & Crew', 'Gourmet Lunch', 'Premium Bar', 'Snorkeling Gear', 'Water Toys', 'Towels'],
    requirements: [],
    isAvailable: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 89
  },
  {
    name: 'Scuba Diving Adventure',
    category: 'Water Sports',
    description: 'Discover the underwater wonders of the Belize Barrier Reef, the second-largest reef system in the world. Certified divers can explore vibrant coral gardens, swim alongside tropical fish, and encounter sea turtles and rays.',
    shortDescription: 'Explore the Belize Barrier Reef',
    images: [
      { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', caption: 'Coral reef diving', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', caption: 'Sea turtle encounter', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800', caption: 'Tropical fish', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800', caption: 'Dive boat', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1580019542155-247062e19ce4?w=800', caption: 'Reef exploration', isPrimary: false }
    ],
    price: 350,
    duration: '4 hours',
    skillLevel: 'intermediate',
    maxParticipants: 8,
    included: ['Equipment', 'Two Tank Dives', 'Expert Guide', 'Refreshments', 'Photos'],
    requirements: ['PADI Certification', 'Swim Proficiency'],
    isAvailable: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 156
  },
  {
    name: 'Rainforest Canopy Tour',
    category: 'Adventure',
    description: 'Soar through the treetops on an exhilarating zipline adventure through the Belizean rainforest. Experience breathtaking views, spot exotic wildlife, and learn about the ecosystem from expert naturalist guides.',
    shortDescription: 'Zipline through tropical rainforest',
    images: [
      { url: 'https://images.unsplash.com/photo-1534777367038-9404f45b869a?w=800', caption: 'Zipline adventure', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800', caption: 'Rainforest canopy', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800', caption: 'Platform views', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800', caption: 'Wildlife spotting', isPrimary: false }
    ],
    price: 175,
    duration: '3 hours',
    skillLevel: 'all levels',
    maxParticipants: 16,
    included: ['Safety Equipment', 'Expert Guides', 'Hotel Transfer', 'Light Snacks', 'Photos'],
    requirements: ['Minimum Age 8', 'Weight Under 250 lbs'],
    isAvailable: true,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 234
  },
  {
    name: 'Spa & Wellness Retreat',
    category: 'Wellness',
    description: 'Rejuvenate body and mind with our full-day wellness experience. Includes a traditional Mayan healing ritual, aromatherapy massage, facial treatment, and healthy gourmet lunch in our tranquil garden setting.',
    shortDescription: 'Full-day luxury spa experience',
    images: [
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Spa treatment room', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', caption: 'Massage therapy', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', caption: 'Relaxation pool', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800', caption: 'Wellness garden', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', caption: 'Meditation area', isPrimary: false }
    ],
    price: 450,
    duration: '6 hours',
    skillLevel: 'all levels',
    maxParticipants: 4,
    included: ['Mayan Ritual', 'Full Body Massage', 'Facial', 'Gourmet Lunch', 'Robe & Slippers', 'Pool Access'],
    requirements: [],
    isAvailable: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 178
  },
  {
    name: 'Ancient Mayan Ruins Tour',
    category: 'Cultural',
    description: 'Step back in time with a guided exploration of ancient Mayan archaeological sites. Visit the magnificent temples of Xunantunich, learn about Mayan history and astronomy, and enjoy a traditional lunch in a local village.',
    shortDescription: 'Explore ancient Mayan temples',
    images: [
      { url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800', caption: 'Mayan temple', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1547558840-8ad6c7f1d7a9?w=800', caption: 'Archaeological site', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1570214476695-19bd467e6f7a?w=800', caption: 'Stone carvings', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Traditional lunch', isPrimary: false }
    ],
    price: 195,
    duration: '8 hours',
    skillLevel: 'all levels',
    maxParticipants: 20,
    included: ['Expert Guide', 'Entrance Fees', 'Traditional Lunch', 'Hotel Transfer', 'Refreshments'],
    requirements: ['Comfortable Walking Shoes'],
    isAvailable: true,
    isFeatured: false,
    rating: 4.8,
    reviewCount: 312
  },
  {
    name: 'Deep Sea Fishing',
    category: 'Water Sports',
    description: 'Cast your line into the rich Caribbean waters in pursuit of trophy fish. Target marlin, sailfish, mahi-mahi, and wahoo with our expert fishing guides on a fully-equipped sport fishing vessel.',
    shortDescription: 'Trophy fishing adventure',
    images: [
      { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', caption: 'Fishing boat', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', caption: 'Big catch', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800', caption: 'Open water', isPrimary: false }
    ],
    price: 800,
    duration: '6 hours',
    skillLevel: 'all levels',
    maxParticipants: 6,
    included: ['Equipment', 'Captain & Mate', 'Bait & Tackle', 'Lunch & Drinks', 'Fish Cleaning'],
    requirements: [],
    isAvailable: true,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 98
  }
];

// ============================================
// EVENTS
// ============================================
const events = [
  {
    name: 'New Year\'s Eve Gala 2025',
    category: 'Gala',
    description: 'Welcome the new year in spectacular fashion at our exclusive black-tie gala. Enjoy a seven-course dinner crafted by our Michelin-starred chefs, premium champagne, live orchestra, and the most stunning fireworks display in the Caribbean.',
    shortDescription: 'Black-tie celebration',
    images: [
      { url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800', caption: 'Grand ballroom', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800', caption: 'Champagne toast', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800', caption: 'Fireworks display', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800', caption: 'Gala dinner setup', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', caption: 'Live orchestra', isPrimary: false }
    ],
    date: new Date('2025-12-31'),
    time: '8:00 PM',
    venue: 'Grand Ballroom',
    venueAddress: 'Main Resort, Level 3',
    price: 750,
    capacity: 300,
    isVIPOnly: false,
    isFeatured: true,
    category: 'Gala',
    status: 'upcoming'
  },
  {
    name: 'Investor Summit Q1 2025',
    category: 'Investor',
    description: 'Exclusive quarterly gathering for MOTA investors. Review portfolio performance, hear development updates from leadership, and network with fellow investors over a gourmet dinner. Diamond members receive priority seating.',
    shortDescription: 'Quarterly investor gathering',
    images: [
      { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', caption: 'Conference setup', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800', caption: 'Presentation hall', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', caption: 'Networking reception', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1560523159-4a9692d222ef?w=800', caption: 'Executive dinner', isPrimary: false }
    ],
    date: new Date('2025-02-15'),
    time: '6:00 PM',
    venue: 'Executive Conference Center',
    venueAddress: 'Tower A, Penthouse Level',
    price: 0,
    capacity: 100,
    isVIPOnly: true,
    isFeatured: true,
    category: 'Investor',
    status: 'upcoming'
  },
  {
    name: 'Caribbean Jazz Festival',
    category: 'Concert',
    description: 'Three nights of world-class jazz performances featuring Grammy-winning artists and local Caribbean talent. Set against our oceanfront stage, this festival combines incredible music with tropical ambiance.',
    shortDescription: 'World-class jazz performances',
    images: [
      { url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', caption: 'Jazz performance', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', caption: 'Oceanfront stage', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800', caption: 'Festival crowd', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800', caption: 'Saxophone solo', isPrimary: false }
    ],
    date: new Date('2025-03-20'),
    time: '7:00 PM',
    venue: 'Oceanfront Amphitheater',
    venueAddress: 'Beachfront Area',
    price: 150,
    capacity: 500,
    isVIPOnly: false,
    isFeatured: true,
    category: 'Concert',
    status: 'upcoming'
  },
  {
    name: 'Wine & Dine Experience',
    category: 'Dining',
    description: 'An evening of culinary excellence featuring a five-course pairing dinner with rare wines from our cellar. Our sommelier guides you through each pairing while our executive chef shares the inspiration behind every dish.',
    shortDescription: 'Five-course wine pairing dinner',
    images: [
      { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800', caption: 'Wine selection', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', caption: 'Fine dining setup', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Gourmet course', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', caption: 'Wine cellar', isPrimary: false }
    ],
    date: new Date('2025-01-25'),
    time: '7:30 PM',
    venue: 'Azure Restaurant',
    venueAddress: 'Oceanfront Tower, Level 1',
    price: 295,
    capacity: 40,
    isVIPOnly: false,
    isFeatured: false,
    category: 'Dining',
    status: 'upcoming'
  },
  {
    name: 'Full Moon Beach Party',
    category: 'Entertainment',
    description: 'Dance under the stars at our legendary monthly full moon celebration. International DJs, fire performers, beach bonfires, and flowing cocktails create an unforgettable night of tropical revelry.',
    shortDescription: 'Monthly beach celebration',
    images: [
      { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', caption: 'Beach party', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Full moon view', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Beach cocktails', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', caption: 'Fire performers', isPrimary: false }
    ],
    date: new Date('2025-01-13'),
    time: '9:00 PM',
    venue: 'Main Beach',
    venueAddress: 'Beachfront',
    price: 75,
    capacity: 400,
    isVIPOnly: false,
    isFeatured: true,
    category: 'Entertainment',
    status: 'upcoming'
  }
];

// ============================================
// NIGHTLIFE
// ============================================
const nightlife = [
  {
    name: 'Velvet Lounge',
    type: 'Lounge',
    description: 'Sophisticated cocktail lounge with intimate seating, craft mixology, and live jazz Thursday through Saturday. The perfect spot for pre-dinner drinks or a nightcap.',
    shortDescription: 'Upscale cocktail experience',
    images: [
      { url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800', caption: 'Lounge interior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Signature cocktails', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800', caption: 'Bar seating', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800', caption: 'Live jazz nights', isPrimary: false }
    ],
    priceRange: '$$$',
    hours: '5:00 PM - 1:00 AM',
    features: ['Craft Cocktails', 'Live Jazz', 'Private Booths', 'VIP Service', 'Cigar Menu'],
    musicType: 'Jazz & Lounge',
    dressCode: 'smart casual',
    minAge: 21,
    reservationRequired: false,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'Main Resort', floor: 1 }
  },
  {
    name: 'Horizon Rooftop',
    type: 'Rooftop Bar',
    description: 'Take in panoramic ocean views from our stunning rooftop venue. By day, a relaxed poolside bar; by night, a vibrant scene with top DJs and the best sunset views on the island.',
    shortDescription: 'Panoramic rooftop experience',
    images: [
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', caption: 'Rooftop view', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Sunset views', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Poolside drinks', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', caption: 'DJ nights', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', caption: 'Night ambiance', isPrimary: false }
    ],
    priceRange: '$$$$',
    hours: '4:00 PM - 2:00 AM',
    features: ['Ocean Views', 'Infinity Pool', 'VIP Cabanas', 'Premium Spirits', 'Sunset Happy Hour'],
    musicType: 'House & Deep House',
    dressCode: 'upscale',
    minAge: 21,
    reservationRequired: true,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'Tower A', floor: 15 }
  },
  {
    name: 'Club Neon',
    type: 'Nightclub',
    description: 'The island\'s premier nightlife destination featuring international DJs, state-of-the-art sound system, and immersive lighting. VIP bottle service available in our exclusive sky boxes.',
    shortDescription: 'Premier dance club',
    images: [
      { url: 'https://images.unsplash.com/photo-1571266028243-d220c6a8b0b9?w=800', caption: 'Dance floor', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', caption: 'DJ booth', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', caption: 'Light show', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800', caption: 'VIP area', isPrimary: false }
    ],
    priceRange: '$$$$',
    hours: '10:00 PM - 4:00 AM',
    features: ['International DJs', 'VIP Sky Boxes', 'Bottle Service', 'LED Dance Floor', 'VIP Entrance'],
    musicType: 'EDM & House',
    dressCode: 'upscale',
    minAge: 21,
    reservationRequired: true,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'Entertainment Complex', floor: 1 }
  },
  {
    name: 'Tiki Beach Bar',
    type: 'Beach Bar',
    description: 'Casual barefoot bar right on the sand. Tropical cocktails, cold beer, and laid-back vibes with live reggae music every evening.',
    shortDescription: 'Casual beachside drinks',
    images: [
      { url: 'https://images.unsplash.com/photo-1528150230181-99bbf7b22162?w=800', caption: 'Beach bar', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Tropical cocktails', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Sunset hour', isPrimary: false }
    ],
    priceRange: '$$',
    hours: '11:00 AM - 11:00 PM',
    features: ['Live Reggae', 'Beach Seating', 'Happy Hour', 'Casual Vibe', 'Fresh Coconuts'],
    musicType: 'Reggae & Island',
    dressCode: 'casual',
    minAge: 18,
    reservationRequired: false,
    isAvailable: true,
    isFeatured: false,
    location: { building: 'Beachfront', floor: 1 }
  }
];

// ============================================
// EXOTIC FLEET
// ============================================
const exoticFleet = [
  {
    name: 'Lamborghini Huracán EVO',
    type: 'car',
    make: 'Lamborghini',
    model: 'Huracán EVO',
    year: 2024,
    description: 'Experience Italian engineering perfection with the Lamborghini Huracán EVO. 640 horsepower of pure exhilaration, with a naturally aspirated V10 engine and cutting-edge aerodynamics.',
    shortDescription: 'V10 supercar, 640hp',
    images: [
      { url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800', isPrimary: false }
    ],
    pricePerDay: 2500,
    pricePerHour: 400,
    specs: { engine: '5.2L V10', horsepower: 640, topSpeed: '202 mph', acceleration: '2.9s' },
    features: ['All-Wheel Drive', 'Carbon Ceramic Brakes', 'Apple CarPlay', 'Rear Camera'],
    isAvailable: true,
    isFeatured: true,
    accessLevel: 'investor',
    investorTierRequired: 'gold',
    rating: 5.0,
    reviewCount: 28
  },
  {
    name: 'Rolls-Royce Ghost',
    type: 'car',
    make: 'Rolls-Royce',
    model: 'Ghost',
    year: 2024,
    description: 'The epitome of luxury motoring. The Rolls-Royce Ghost delivers an effortless driving experience with unparalleled craftsmanship and whisper-quiet refinement.',
    shortDescription: 'Ultimate luxury sedan',
    images: [
      { url: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800', isPrimary: false }
    ],
    pricePerDay: 1800,
    pricePerHour: 300,
    specs: { engine: '6.75L V12', horsepower: 563, topSpeed: '155 mph', acceleration: '4.6s' },
    features: ['Starlight Headliner', 'Massage Seats', 'Night Vision', 'Champagne Cooler'],
    isAvailable: true,
    isFeatured: true,
    accessLevel: 'investor',
    investorTierRequired: 'platinum',
    rating: 5.0,
    reviewCount: 19
  },
  {
    name: 'Ferrari 488 Spider',
    type: 'car',
    make: 'Ferrari',
    model: '488 Spider',
    year: 2023,
    description: 'Open-top exhilaration meets Ferrari performance. The 488 Spider combines breathtaking speed with the freedom of convertible driving under Caribbean skies.',
    shortDescription: 'Twin-turbo V8 convertible',
    images: [
      { url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', isPrimary: false }
    ],
    pricePerDay: 2200,
    pricePerHour: 350,
    specs: { engine: '3.9L V8 Twin-Turbo', horsepower: 661, topSpeed: '203 mph', acceleration: '3.0s' },
    features: ['Retractable Hardtop', 'Carbon Fiber Interior', 'Racing Mode', 'Ferrari Telemetry'],
    isAvailable: true,
    isFeatured: true,
    accessLevel: 'investor',
    investorTierRequired: 'gold',
    rating: 5.0,
    reviewCount: 34
  },
  {
    name: 'Bentley Continental GT',
    type: 'car',
    make: 'Bentley',
    model: 'Continental GT',
    year: 2024,
    description: 'Grand touring perfection. The Continental GT combines hand-crafted British luxury with exhilarating W12 performance for the ultimate driving experience.',
    shortDescription: 'W12 grand tourer',
    images: [
      { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800', isPrimary: false }
    ],
    pricePerDay: 1500,
    pricePerHour: 250,
    specs: { engine: '6.0L W12 Twin-Turbo', horsepower: 626, topSpeed: '207 mph', acceleration: '3.6s' },
    features: ['Rotating Display', 'Diamond Knurling', 'Naim Audio', 'All-Wheel Drive'],
    isAvailable: true,
    isFeatured: false,
    accessLevel: 'member',
    investorTierRequired: '',
    rating: 4.9,
    reviewCount: 22
  },
  {
    name: 'Sunseeker 76 Yacht',
    type: 'yacht',
    length: '76ft',
    capacity: 8,
    description: 'A 76-foot masterpiece of British yacht building. Four luxurious cabins, expansive deck spaces, and performance capabilities perfect for Caribbean island hopping.',
    shortDescription: '76ft luxury motor yacht',
    images: [
      { url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=800', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800', isPrimary: false }
    ],
    pricePerDay: 8500,
    pricePerHour: 1200,
    specs: { cabins: 4, crew: 3 },
    features: ['Captain & Crew', 'Water Toys', 'Gourmet Galley', 'Satellite TV', 'Tender'],
    isAvailable: true,
    isFeatured: true,
    accessLevel: 'investor',
    investorTierRequired: 'platinum',
    rating: 5.0,
    reviewCount: 15
  },
  {
    name: 'Azimut 55 Flybridge',
    type: 'yacht',
    length: '55ft',
    capacity: 6,
    description: 'Italian elegance meets versatile performance. The Azimut 55 offers three comfortable cabins and generous outdoor spaces ideal for day trips or overnight adventures.',
    shortDescription: '55ft Italian flybridge yacht',
    images: [
      { url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800', isPrimary: false }
    ],
    pricePerDay: 5500,
    pricePerHour: 800,
    specs: { cabins: 3, crew: 2 },
    features: ['Flybridge', 'Hydraulic Swim Platform', 'Bow Sunpad', 'Full Galley'],
    isAvailable: true,
    isFeatured: false,
    accessLevel: 'investor',
    investorTierRequired: 'gold',
    rating: 4.8,
    reviewCount: 21
  },
  {
    name: 'Princess V65',
    type: 'yacht',
    length: '65ft',
    capacity: 10,
    description: 'Sleek, sporty, and supremely comfortable. The Princess V65 delivers exhilarating performance with elegant British design and luxurious accommodations.',
    shortDescription: '65ft sport yacht',
    images: [
      { url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=800', isPrimary: false }
    ],
    pricePerDay: 6500,
    pricePerHour: 950,
    specs: { cabins: 3, crew: 2 },
    features: ['Sport Flybridge', 'Jet Skis Included', 'Premium Sound', 'BBQ Grill'],
    isAvailable: true,
    isFeatured: true,
    accessLevel: 'investor',
    investorTierRequired: 'gold',
    rating: 4.9,
    reviewCount: 18
  }
];

// ============================================
// CONTENT (Slideshow)
// ============================================
const contentData = [
  {
    key: 'homepage_slideshow',
    slides: [
      {
        title: 'Welcome to MOTA',
        subtitle: 'Luxury Resort & Investment Destination',
        imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200',
        linkType: 'none',
        order: 0,
        isActive: true
      },
      {
        title: 'Exotic Fleet',
        subtitle: 'Supercars & Luxury Yachts',
        imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200',
        linkType: 'tab',
        linkTab: 1,
        order: 1,
        isActive: true
      },
      {
        title: 'Fine Dining',
        subtitle: 'World-Class Culinary Experiences',
        imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
        linkType: 'tab',
        linkTab: 1,
        order: 2,
        isActive: true
      },
      {
        title: 'Investor Benefits',
        subtitle: 'Exclusive Access & Returns',
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
        linkType: 'screen',
        linkTarget: 'InvestorPortal',
        order: 3,
        isActive: true
      }
    ]
  }
];

// ============================================
// FUNDING ROUNDS
// ============================================
const fundingRounds = [
  {
    name: 'Series A - Foundation',
    phase: 1,
    targetAmount: 50000000,
    raisedAmount: 50000000,
    minimumInvestment: 2500000,
    status: 'closed',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-06-30'),
    period: '2023',
    description: 'Initial funding round for land acquisition and core infrastructure.',
    milestones: [
      { name: 'Land Acquisition', status: 'completed', progress: 100 },
      { name: 'Permits & Licensing', status: 'completed', progress: 100 },
      { name: 'Initial Construction', status: 'completed', progress: 100 }
    ],
    projectedReturns: { annual: 12, total: 180 }
  },
  {
    name: 'Series B - Expansion',
    phase: 2,
    targetAmount: 100000000,
    raisedAmount: 78500000,
    minimumInvestment: 2500000,
    status: 'active',
    startDate: new Date('2024-01-01'),
    period: '2024-2025',
    description: 'Current round funding resort expansion and marina development.',
    milestones: [
      { name: 'Marina Development', status: 'in_progress', progress: 65 },
      { name: 'Hotel Tower A', status: 'in_progress', progress: 45 },
      { name: 'Casino Floor', status: 'pending', progress: 20 }
    ],
    projectedReturns: { annual: 15, total: 225 }
  },
  {
    name: 'Series C - Completion',
    phase: 3,
    targetAmount: 150000000,
    raisedAmount: 0,
    minimumInvestment: 2500000,
    status: 'upcoming',
    startDate: new Date('2026-01-01'),
    period: '2026-2028',
    description: 'Final phase funding for full resort completion and grand opening.',
    milestones: [
      { name: 'Hotel Tower B', status: 'pending', progress: 0 },
      { name: 'Entertainment Complex', status: 'pending', progress: 0 },
      { name: 'Grand Opening', status: 'pending', progress: 0 }
    ],
    projectedReturns: { annual: 18, total: 270 }
  }
];

// ============================================
// NOTIFICATIONS
// ============================================
const notifications = [
  { targetType: 'all', title: '🎉 Welcome to MOTA', message: 'Thank you for joining us. Explore our world-class amenities, exclusive events, and investment opportunities.', type: 'info', status: 'sent', sentAt: new Date() },
  { targetType: 'investors', title: '📊 Q4 Investment Update', message: 'Your quarterly portfolio statement is now available. Log in to view your returns and upcoming dividend schedule.', type: 'info', status: 'sent', sentAt: new Date() },
  { targetType: 'gold', title: '🎉 Exclusive Gold Member Event', message: 'You\'re invited to the Sunset Yacht Party on December 22nd. RSVP now to secure your spot!', type: 'event', status: 'sent', sentAt: new Date() },
];

// ============================================
// SEED FUNCTION
// ============================================
async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('\n🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Lodging.deleteMany({}),
      Restaurant.deleteMany({}),
      Activity.deleteMany({}),
      Event.deleteMany({}),
      Nightlife.deleteMany({}),
      FundingRound.deleteMany({}),
      Content.deleteMany({}),
      ExoticFleet.deleteMany({}),
      Notification.deleteMany({})
    ]);
    
    console.log('👥 Seeding users...');
    for (const u of users) {
      const user = new User(u);
      await user.save();
    }
    
    console.log('🏠 Seeding lodging...');
    await Lodging.insertMany(lodgings);
    
    console.log('🍽️  Seeding restaurants (eateries)...');
    await Restaurant.insertMany(restaurants);
    
    console.log('🏄 Seeding activities (experiences)...');
    await Activity.insertMany(activities);
    
    console.log('🎉 Seeding events...');
    await Event.insertMany(events);
    
    console.log('🌙 Seeding nightlife...');
    await Nightlife.insertMany(nightlife);
    
    console.log('💰 Seeding funding rounds...');
    await FundingRound.insertMany(fundingRounds);
    
    console.log('📄 Seeding content (slideshow)...');
    await Content.insertMany(contentData);
    
    console.log('🚗 Seeding exotic fleet...');
    await ExoticFleet.insertMany(exoticFleet);
    
    console.log('🔔 Seeding notifications...');
    await Notification.insertMany(notifications);
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ DATABASE SEEDED SUCCESSFULLY WITH MULTIPLE IMAGES!');
    console.log('═'.repeat(60));
    console.log('\n📱 Demo Accounts:');
    console.log('   guest@demo.com / demo123 (Guest)');
    console.log('   member@demo.com / demo123 (Member)');
    console.log('   investor@demo.com / demo123 (Gold Investor)');
    console.log('   platinum@demo.com / demo123 (Platinum Investor)');
    console.log('   diamond@demo.com / demo123 (Diamond Investor)');
    console.log('   admin@mota.com / admin123 (Admin/Diamond)');
    console.log('\n📸 Image Counts:');
    console.log(`   🍽️  Restaurants: ${restaurants.length} items, ${restaurants.reduce((a, r) => a + r.images.length, 0)} total images`);
    console.log(`   🏠 Lodging: ${lodgings.length} items, ${lodgings.reduce((a, l) => a + l.images.length, 0)} total images`);
    console.log(`   🏄 Activities: ${activities.length} items, ${activities.reduce((a, x) => a + x.images.length, 0)} total images`);
    console.log(`   🎉 Events: ${events.length} items, ${events.reduce((a, e) => a + e.images.length, 0)} total images`);
    console.log(`   🌙 Nightlife: ${nightlife.length} items, ${nightlife.reduce((a, n) => a + n.images.length, 0)} total images`);
    console.log(`   🚗 Fleet: ${exoticFleet.length} items, ${exoticFleet.reduce((a, f) => a + f.images.length, 0)} total images`);
    console.log('═'.repeat(60) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();