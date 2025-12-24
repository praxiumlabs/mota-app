/**
 * MOTA Database Seed - Ambergris Caye Real Listings
 * Authentic Belize businesses for Hotels, Restaurants, Nightlife, Wellness
 * With GPS Coordinates for all listings
 * Run: node seed-ambergris.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Restaurant = require('./models/Restaurant');
const Lodging = require('./models/Lodging');
const Nightlife = require('./models/Nightlife');
const Activity = require('./models/Activity');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/mota';

// ============================================
// RESTAURANTS - Real Ambergris Caye Eateries
// ============================================
const restaurants = [
  {
    name: "Elvi's Kitchen",
    cuisine: 'Belizean',
    description: "Belize's oldest and most beloved restaurant, serving guests since 1976. Famous for Jennie's signature curry, stone crab claws, and the legendary coconut pie. Dining under a flamboyant tree with original sand floors and air conditioning. BTB Restaurant of the Year 2022.",
    shortDescription: 'Legendary Belizean cuisine since 1976',
    images: [
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', caption: 'Dining under the flamboyant tree', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', caption: 'Award-winning cuisine', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Stone crab claws', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', caption: 'Intimate atmosphere', isPrimary: false }
    ],
    priceRange: '$$$',
    rating: 4.5,
    reviewCount: 892,
    dressCode: 'smart casual',
    reservationRequired: true,
    features: ['Air Conditioning', 'Live Music', 'Full Bar', 'Outdoor Seating', 'Historic Venue'],
    hours: 'Mon-Sat 11:00 AM - 10:00 PM',
    phone: '+501-226-2404',
    email: 'reservations@elviskitchen.com',
    location: { building: 'Pescador Drive', floor: 1, address: 'Pescador Drive, San Pedro Town' },
    coordinates: { lat: 17.9178, lng: -87.9571 },
    isAvailable: true,
    isFeatured: true,
    dogFriendly: false,
    kidsFriendly: true
  },
  {
    name: 'Hidden Treasure Restaurant',
    cuisine: 'Caribbean Fine Dining',
    description: 'Romantic fine dining hidden in lush tropical gardens, 2 miles south of town. Famous for almond encrusted grouper and blackened snapper. Complimentary shuttle service available. The perfect spot for anniversaries and special occasions.',
    shortDescription: 'Romantic garden fine dining',
    images: [
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', caption: 'Garden dining setting', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', caption: 'Tropical garden ambiance', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800', caption: 'Fresh seafood dishes', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', caption: 'Elegant presentation', isPrimary: false }
    ],
    priceRange: '$$$$',
    rating: 4.7,
    reviewCount: 456,
    dressCode: 'smart casual',
    reservationRequired: true,
    features: ['Garden Setting', 'Complimentary Shuttle', 'Romantic', 'Full Bar', 'Private Dining'],
    hours: '5:00 PM - 9:30 PM, Closed Tuesday',
    phone: '+501-226-4111',
    email: 'reservations@hiddentreasurebelize.com',
    location: { building: 'South Ambergris', floor: 1, address: '2 Miles South, San Pedro' },
    coordinates: { lat: 17.8989, lng: -87.9612 },
    isAvailable: true,
    isFeatured: true,
    dogFriendly: false,
    kidsFriendly: true
  },
  {
    name: 'Blue Water Grill',
    cuisine: 'Seafood & Sushi',
    description: 'Stunning beachfront restaurant at SunBreeze Hotel featuring wood-fired pizzas, fresh sushi, and Caribbean seafood. Live music every Friday. The perfect blend of casual beach vibes and culinary excellence.',
    shortDescription: 'Beachfront sushi & seafood',
    images: [
      { url: 'https://images.unsplash.com/photo-1528150230181-99bbf7b22162?w=800', caption: 'Beachfront dining', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', caption: 'Fresh sushi selection', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', caption: 'Wood-fired pizza', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800', caption: 'Seafood platters', isPrimary: false }
    ],
    priceRange: '$$$',
    rating: 4.5,
    reviewCount: 678,
    dressCode: 'casual',
    reservationRequired: true,
    features: ['Beachfront', 'Live Music Fridays', 'Sushi Bar', 'Wood-Fired Pizza', 'Full Bar'],
    hours: '7:00 AM - 10:00 PM Daily',
    phone: '+501-226-3347',
    email: 'info@bluewatergrill-bz.com',
    location: { building: 'SunBreeze Hotel', floor: 1, address: 'Coconut Drive, San Pedro' },
    coordinates: { lat: 17.9175, lng: -87.9568 },
    isAvailable: true,
    isFeatured: true,
    dogFriendly: true,
    kidsFriendly: true
  },
  {
    name: "Estel's Dine by the Sea",
    cuisine: 'Breakfast & Caribbean',
    description: "Iconic beachfront breakfast spot with tables right in the sand. Famous for fry jacks, huevos rancheros, and the legendary Sunday BBQ. Arrive early as it fills up fast. A San Pedro institution.",
    shortDescription: 'Legendary beachfront breakfast',
    images: [
      { url: 'https://images.unsplash.com/photo-1528150230181-99bbf7b22162?w=800', caption: 'Tables in the sand', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Famous breakfast spread', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Ocean view dining', isPrimary: false }
    ],
    priceRange: '$$',
    rating: 4.6,
    reviewCount: 1245,
    dressCode: 'casual',
    reservationRequired: false,
    features: ['Beachfront', 'Outdoor Seating', 'Sunday BBQ', 'Family Friendly', 'Breakfast Spot'],
    hours: '6:00 AM - 2:00 PM Daily',
    phone: '+501-226-2019',
    email: '',
    location: { building: 'Barrier Reef Drive', floor: 1, address: 'Barrier Reef Drive, San Pedro' },
    coordinates: { lat: 17.9186, lng: -87.9564 },
    isAvailable: true,
    isFeatured: true,
    dogFriendly: true,
    kidsFriendly: true
  },
  {
    name: 'El Fogon Restaurant',
    cuisine: 'Traditional Belizean',
    description: 'Authentic Belizean cuisine cooked over traditional fire hearths (fogons). Known for affordable local dishes including the best rice and beans on the island, stewed chicken, and conch soup. A local favorite.',
    shortDescription: 'Authentic fire hearth cooking',
    images: [
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', caption: 'Traditional cooking', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Rice and beans plate', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', caption: 'Local atmosphere', isPrimary: false }
    ],
    priceRange: '$',
    rating: 4.4,
    reviewCount: 534,
    dressCode: 'casual',
    reservationRequired: false,
    features: ['Traditional Cooking', 'Budget Friendly', 'Local Favorite', 'Vegetarian Options'],
    hours: '6:00 AM - 10:00 PM Daily',
    phone: '+501-206-2121',
    email: '',
    location: { building: 'Trigger Fish Street', floor: 1, address: 'Trigger Fish Street, San Pedro' },
    coordinates: { lat: 17.9145, lng: -87.9589 },
    isAvailable: true,
    isFeatured: false,
    dogFriendly: false,
    kidsFriendly: true
  },
  {
    name: 'The Truck Stop',
    cuisine: 'Food Park',
    description: 'Unique shipping container food park with multiple vendors serving pizza, Asian, Latin, and ice cream. Features a pool with swim-up bar, movie nights, and live music. Family-friendly destination 1.5 miles north of town.',
    shortDescription: 'Container food park with pool',
    images: [
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', caption: 'Container food park', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', caption: 'Wood-fired pizza', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Swim-up bar', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', caption: 'Movie nights', isPrimary: false }
    ],
    priceRange: '$$',
    rating: 4.6,
    reviewCount: 876,
    dressCode: 'casual',
    reservationRequired: false,
    features: ['Pool', 'Swim-up Bar', 'Movie Nights', 'Live Music', 'Family Friendly', 'Multiple Vendors'],
    hours: '12:00 PM - 9:00 PM, Closed Mon-Tue',
    phone: '+501-226-3663',
    email: 'info@truckstopbz.com',
    location: { building: 'North San Pedro', floor: 1, address: '1.5 Miles North, San Pedro' },
    coordinates: { lat: 17.9289, lng: -87.9523 },
    isAvailable: true,
    isFeatured: true,
    dogFriendly: true,
    kidsFriendly: true
  },
  {
    name: "Robin's Kitchen",
    cuisine: 'Jamaican BBQ',
    description: "Unassuming hole-in-the-wall famous for incredible jerk chicken BBQ. Line up beside the smoking grill for authentic Caribbean flavors. Cash preferred. Gets there early - they sell out!",
    shortDescription: 'Famous jerk chicken BBQ',
    images: [
      { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', caption: 'Jerk chicken grill', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'BBQ plate', isPrimary: false }
    ],
    priceRange: '$',
    rating: 4.6,
    reviewCount: 423,
    dressCode: 'casual',
    reservationRequired: false,
    features: ['Authentic Jerk', 'Budget Friendly', 'Cash Preferred', 'Outdoor Seating'],
    hours: '11:00 AM - 8:00 PM (or sold out)',
    phone: '+501-610-1892',
    email: '',
    location: { building: 'South San Pedro', floor: 1, address: 'South Ambergris Caye' },
    coordinates: { lat: 17.9023, lng: -87.9598 },
    isAvailable: true,
    isFeatured: false,
    dogFriendly: true,
    kidsFriendly: true
  },
  {
    name: 'Wild Mangos',
    cuisine: 'Seafood',
    description: 'Waterfront restaurant in downtown San Pedro offering superb seafood dining in a casual atmosphere. Known for fresh catch of the day, ceviche, and seafood platters.',
    shortDescription: 'Waterfront seafood dining',
    images: [
      { url: 'https://images.unsplash.com/photo-1528150230181-99bbf7b22162?w=800', caption: 'Waterfront setting', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800', caption: 'Fresh seafood', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Ceviche', isPrimary: false }
    ],
    priceRange: '$$$',
    rating: 4.5,
    reviewCount: 567,
    dressCode: 'casual',
    reservationRequired: true,
    features: ['Waterfront', 'Fresh Seafood', 'Full Bar', 'Casual Atmosphere'],
    hours: '11:00 AM - 10:00 PM',
    phone: '+501-226-2859',
    email: '',
    location: { building: 'Barrier Reef Drive', floor: 1, address: 'Barrier Reef Drive, San Pedro' },
    coordinates: { lat: 17.9182, lng: -87.9567 },
    isAvailable: true,
    isFeatured: false,
    dogFriendly: false,
    kidsFriendly: true
  },
  {
    name: 'Rain Restaurant & Rooftop Terrace',
    cuisine: 'Caribbean Fusion',
    description: 'Rooftop fine dining at Grand Caribe with stunning sunset views. Caribbean fusion cuisine with craft cocktails. The perfect setting for romantic dinners and special celebrations.',
    shortDescription: 'Rooftop fine dining with views',
    images: [
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', caption: 'Rooftop terrace', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Sunset views', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', caption: 'Fine dining', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Craft cocktails', isPrimary: false }
    ],
    priceRange: '$$$$',
    rating: 4.5,
    reviewCount: 234,
    dressCode: 'smart casual',
    reservationRequired: true,
    features: ['Rooftop Terrace', 'Sunset Views', 'Craft Cocktails', 'Fine Dining', 'Romantic'],
    hours: '5:00 PM - 10:00 PM',
    phone: '+501-226-4726',
    email: '',
    location: { building: 'Grand Caribe', floor: 3, address: '2 Miles North, San Pedro' },
    coordinates: { lat: 17.9378, lng: -87.9489 },
    isAvailable: true,
    isFeatured: true,
    dogFriendly: false,
    kidsFriendly: true
  },
  {
    name: 'Palmilla Restaurant',
    cuisine: 'International Fine Dining',
    description: 'Award-winning fine dining at Victoria House Resort. White tablecloth service with exceptional wine list and oceanfront setting. Known for filet mignon, cashew crusted fish, and sticky toffee pudding.',
    shortDescription: 'Award-winning oceanfront dining',
    images: [
      { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', caption: 'Elegant dining room', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', caption: 'Oceanfront setting', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800', caption: 'Wine selection', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Fine cuisine', isPrimary: false }
    ],
    priceRange: '$$$$',
    rating: 4.7,
    reviewCount: 389,
    dressCode: 'smart casual',
    reservationRequired: true,
    features: ['Oceanfront', 'Wine Cellar', 'Fine Dining', 'Romantic', 'Resort Setting'],
    hours: '7:00 AM - 10:00 PM',
    phone: '+501-226-2067',
    email: 'palmilla@victoria-house.com',
    location: { building: 'Victoria House Resort', floor: 1, address: '22 Coconut Drive, San Pedro' },
    coordinates: { lat: 17.9119, lng: -87.9583 },
    isAvailable: true,
    isFeatured: true,
    dogFriendly: false,
    kidsFriendly: true
  },
  {
    name: 'Palapa Bar & Grill',
    cuisine: 'Beach Bar & Grill',
    description: "Belize's original over-the-water beach bar. Float in inner tubes while enjoying drinks delivered via beer zip line. Famous for ceviche, fish sandwiches, and rum punch. Live music daily.",
    shortDescription: 'Original over-water beach bar',
    images: [
      { url: 'https://images.unsplash.com/photo-1528150230181-99bbf7b22162?w=800', caption: 'Over-water bar', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Tropical cocktails', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Floating experience', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Fresh ceviche', isPrimary: false }
    ],
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 1567,
    dressCode: 'casual',
    reservationRequired: false,
    features: ['Over Water', 'Beer Zip Line', 'Inner Tubes', 'Live Music', 'Iconic Venue'],
    hours: '11:00 AM - 10:00 PM',
    phone: '+501-226-3111',
    email: 'info@palapabarandgrill.com',
    location: { building: 'Boca Del Rio', floor: 1, address: 'Boca Del Rio, San Pedro' },
    coordinates: { lat: 17.9234, lng: -87.9545 },
    isAvailable: true,
    isFeatured: true,
    dogFriendly: true,
    kidsFriendly: true
  },
  {
    name: 'Caliente Restaurant',
    cuisine: 'Mexican-Belizean',
    description: 'Lagoon-side restaurant combining Mexican and Belizean cuisine. Famous for Margarita Fridays and lobster coconut curry. Relaxed atmosphere with stunning lagoon views.',
    shortDescription: 'Mexican-Belizean lagoon dining',
    images: [
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', caption: 'Lagoon views', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800', caption: 'Mexican dishes', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Margaritas', isPrimary: false }
    ],
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 345,
    dressCode: 'casual',
    reservationRequired: true,
    features: ['Lagoon Views', 'Margarita Fridays', 'Family Friendly', 'Outdoor Seating'],
    hours: 'Lunch and Dinner, Closed Monday',
    phone: '+501-226-2870',
    email: '',
    location: { building: 'Lagoon Side', floor: 1, address: 'Lagoon Side, San Pedro' },
    coordinates: { lat: 17.9156, lng: -87.9612 },
    isAvailable: true,
    isFeatured: false,
    dogFriendly: true,
    kidsFriendly: true
  },
  {
    name: "Frenchy's Restaurant & Bakery",
    cuisine: 'French-Caribbean',
    description: 'French-inspired fine dining with exceptional seafood and steaks. Known for outstanding pastries, lobster tail, and Thai curry seafood. Elegant atmosphere in downtown San Pedro.',
    shortDescription: 'French bakery & fine dining',
    images: [
      { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', caption: 'Elegant dining', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', caption: 'Fresh pastries', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Seafood dishes', isPrimary: false }
    ],
    priceRange: '$$$$',
    rating: 4.9,
    reviewCount: 278,
    dressCode: 'smart casual',
    reservationRequired: true,
    features: ['Bakery', 'Fine Dining', 'French Cuisine', 'Pastries', 'Full Bar'],
    hours: '6:30 AM - 9:00 PM',
    phone: '+501-226-2662',
    email: '',
    location: { building: 'San Pedro Town', floor: 1, address: 'San Pedro Town' },
    coordinates: { lat: 17.9189, lng: -87.9562 },
    isAvailable: true,
    isFeatured: true,
    dogFriendly: false,
    kidsFriendly: true
  },
  {
    name: "Lily's Treasure Chest",
    cuisine: 'Belizean Seafood',
    description: 'Local favorite in front of Amigos Del Mar Dive Shop. Fresh, tasty, and affordable seafood. Popular with divers before and after trips. Great happy hour specials.',
    shortDescription: 'Local seafood favorite',
    images: [
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', caption: 'Local atmosphere', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Fresh fish', isPrimary: false }
    ],
    priceRange: '$',
    rating: 4.4,
    reviewCount: 312,
    dressCode: 'casual',
    reservationRequired: false,
    features: ['Local Favorite', 'Budget Friendly', 'Happy Hour', 'Fresh Seafood'],
    hours: '7:00 AM - 9:00 PM',
    phone: '+501-226-2650',
    email: '',
    location: { building: 'Barrier Reef Drive', floor: 1, address: 'Barrier Reef Drive, San Pedro' },
    coordinates: { lat: 17.9179, lng: -87.9566 },
    isAvailable: true,
    isFeatured: false,
    dogFriendly: false,
    kidsFriendly: true
  },
  {
    name: 'Aji Tapa Bar & Restaurant',
    cuisine: 'Spanish Tapas',
    description: 'Spanish tapas-style dining at Bella Vista Resort. Great for sharing with seafood paella as the signature dish. Beachfront setting with full bar.',
    shortDescription: 'Spanish tapas beachfront',
    images: [
      { url: 'https://images.unsplash.com/photo-1528150230181-99bbf7b22162?w=800', caption: 'Beachfront dining', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800', caption: 'Tapas selection', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800', caption: 'Seafood paella', isPrimary: false }
    ],
    priceRange: '$$$',
    rating: 4.7,
    reviewCount: 234,
    dressCode: 'smart casual',
    reservationRequired: true,
    features: ['Tapas Style', 'Beachfront', 'Sharing Plates', 'Full Bar', 'Resort Setting'],
    hours: '11:00 AM - 10:00 PM',
    phone: '+501-226-3739',
    email: '',
    location: { building: 'Bella Vista Resort', floor: 1, address: 'South Ambergris Caye' },
    coordinates: { lat: 17.9023, lng: -87.9601 },
    isAvailable: true,
    isFeatured: false,
    dogFriendly: false,
    kidsFriendly: true
  },
  {
    name: 'Caramba Restaurant & Bar',
    cuisine: 'Seafood-Caribbean',
    description: 'Popular restaurant known for build-your-own seafood platters. Great for groups with stone crab claws, lobster, and grouper options. Casual Caribbean atmosphere.',
    shortDescription: 'Build your own seafood platters',
    images: [
      { url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800', caption: 'Seafood platters', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Stone crab claws', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', caption: 'Casual atmosphere', isPrimary: false }
    ],
    priceRange: '$$',
    rating: 4.4,
    reviewCount: 456,
    dressCode: 'casual',
    reservationRequired: true,
    features: ['Build Your Own', 'Seafood Platters', 'Full Bar', 'Groups Welcome'],
    hours: '11:00 AM - 10:00 PM',
    phone: '+501-226-4321',
    email: '',
    location: { building: 'Pescador Drive', floor: 1, address: 'Pescador Drive, San Pedro' },
    coordinates: { lat: 17.9167, lng: -87.9578 },
    isAvailable: true,
    isFeatured: false,
    dogFriendly: false,
    kidsFriendly: true
  },
  {
    name: "Jambel's Jerk Pit",
    cuisine: 'Caribbean Fusion',
    description: 'Caribbean and Belizean fusion at SunBreeze Suites. Known for jerk chicken and Caribbean-inspired dishes. Casual beach atmosphere.',
    shortDescription: 'Caribbean jerk specialties',
    images: [
      { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', caption: 'Jerk chicken', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Caribbean dishes', isPrimary: false }
    ],
    priceRange: '$$',
    rating: 4.3,
    reviewCount: 198,
    dressCode: 'casual',
    reservationRequired: false,
    features: ['Jerk Specialties', 'Beach Setting', 'Caribbean Fusion'],
    hours: '11:00 AM - 9:00 PM',
    phone: '+501-226-4341',
    email: '',
    location: { building: 'SunBreeze Suites', floor: 1, address: 'San Pedro Town' },
    coordinates: { lat: 17.9178, lng: -87.9566 },
    isAvailable: true,
    isFeatured: false,
    dogFriendly: false,
    kidsFriendly: true
  },
  {
    name: 'Belize Chocolate Company',
    cuisine: 'Café & Chocolate',
    description: 'Artisan chocolate shop and café on Barrier Reef Drive. Famous for bean-to-bar chocolate, chocolate drinks, and chocolate-making classes. Perfect for a sweet treat.',
    shortDescription: 'Artisan chocolate café',
    images: [
      { url: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800', caption: 'Artisan chocolates', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800', caption: 'Hot chocolate', isPrimary: false }
    ],
    priceRange: '$$',
    rating: 4.8,
    reviewCount: 567,
    dressCode: 'casual',
    reservationRequired: false,
    features: ['Bean to Bar', 'Chocolate Classes', 'Café', 'Artisan Products', 'Gifts'],
    hours: '9:00 AM - 5:00 PM',
    phone: '+501-226-3015',
    email: '',
    location: { building: 'Barrier Reef Drive', floor: 1, address: 'Barrier Reef Drive, San Pedro' },
    coordinates: { lat: 17.9183, lng: -87.9565 },
    isAvailable: true,
    isFeatured: false,
    dogFriendly: false,
    kidsFriendly: true
  }
];

// ============================================
// LODGING - Real Ambergris Caye Hotels/Resorts
// Valid types: Villa, Bungalow, Suite, Penthouse, Cottage
// ============================================
const lodgings = [
  {
    name: 'Victoria House Resort & Spa',
    type: 'Villa',
    description: 'Award-winning boutique resort offering 42 luxurious rooms including casitas, suites, and private villas. Features infinity pool, full-service spa, Palmilla Restaurant, and private beach. Located 2 miles south of San Pedro Town. British colonial elegance meets Caribbean relaxation.',
    shortDescription: 'Award-winning boutique resort',
    images: [
      { url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', caption: 'Resort exterior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Oceanfront pool', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', caption: 'Luxury suite', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', caption: 'Private beach', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Spa treatment', isPrimary: false }
    ],
    price: 450,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    squareFeet: 650,
    view: 'ocean',
    amenities: ['Infinity Pool', 'Full Spa', 'Fine Dining', 'Private Beach', 'Diving', 'Kayaks', 'Paddleboards', 'Bicycles', 'WiFi', 'Concierge'],
    features: ['24/7 Concierge', 'Airport Transfer', 'Daily Housekeeping', 'Tour Desk'],
    rating: 4.8,
    reviewCount: 1234,
    isAvailable: true,
    isFeatured: true,
    location: { building: '22 Coconut Drive', floor: 1 },
    coordinates: { lat: 17.9119, lng: -87.9583 }
  },
  {
    name: "Ramon's Village Resort",
    type: 'Bungalow',
    description: "Tahitian-style resort with authentic palm-thatched cabanas set in tropical gardens. Features lagoon-style pool, dive center, Pineapples Restaurant, and pristine beach. One of the oldest resorts on the island, opened in 1982. Steps from downtown San Pedro.",
    shortDescription: 'Tahitian-style beach cabanas',
    images: [
      { url: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800', caption: 'Thatched cabanas', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Tropical gardens', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', caption: 'Beachfront', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', caption: 'Lagoon pool', isPrimary: false }
    ],
    price: 280,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    squareFeet: 500,
    view: 'garden',
    amenities: ['Pool', 'Beach Day Spa', 'Restaurant', 'Dive Shop', 'Beach', 'Garden', 'WiFi', 'Airport Shuttle'],
    features: ['Free Airport Shuttle', 'Dive Center', 'Car Rental', 'Gift Shop'],
    rating: 4.6,
    reviewCount: 987,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'Coconut Drive', floor: 1 },
    coordinates: { lat: 17.9183, lng: -87.9567 }
  },
  {
    name: 'Mahogany Bay Resort & Beach Club',
    type: 'Villa',
    description: 'Curio Collection by Hilton resort featuring chic beach cottages and villas. Includes The Sanctuary Spa with 8 treatment rooms, private beach, and pool. Located 15 minutes by golf cart from San Pedro Town.',
    shortDescription: 'Hilton Curio Collection resort',
    images: [
      { url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', caption: 'Beach cottages', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'The Sanctuary Spa', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Pool area', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', caption: 'Private beach', isPrimary: false }
    ],
    price: 380,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    squareFeet: 600,
    view: 'ocean',
    amenities: ['Pool', 'Full Spa', 'Restaurant', 'Beach Club', 'WiFi', 'Golf Cart Rental'],
    features: ['Hilton Honors', 'Full-Service Spa', 'Beach Club Access'],
    rating: 4.7,
    reviewCount: 567,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'South Ambergris', floor: 1 },
    coordinates: { lat: 17.8956, lng: -87.9612 }
  },
  {
    name: 'Matachica Resort & Spa',
    type: 'Bungalow',
    description: 'Adults-only boutique resort with colorful beach casitas and villas. Features Mambo Restaurant, full-service spa, and Danny\'s Tree Bar. Perfect for couples seeking romantic seclusion. 5 miles north of San Pedro.',
    shortDescription: 'Adults-only romantic retreat',
    images: [
      { url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800', caption: 'Colorful casitas', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Beachfront', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Spa treatments', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', caption: 'Romantic room', isPrimary: false }
    ],
    price: 420,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    squareFeet: 550,
    view: 'ocean',
    amenities: ['Pool', 'Full Spa', 'Restaurant', 'Bar', 'Beach', 'Kayaks', 'Paddleboards', 'Bicycles', 'WiFi'],
    features: ['Adults Only', 'Romantic Setting', 'Natural Ingredients Spa'],
    rating: 4.8,
    reviewCount: 456,
    isAvailable: true,
    isFeatured: true,
    location: { building: '5 Miles North', floor: 1 },
    coordinates: { lat: 17.9589, lng: -87.9389 }
  },
  {
    name: 'The Phoenix Resort',
    type: 'Penthouse',
    description: 'Luxury beachfront condominiums with fully equipped kitchens. Features rooftop pool with stunning views, on-site dining, and prime downtown location. Perfect for families and extended stays.',
    shortDescription: 'Luxury beachfront condos',
    images: [
      { url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', caption: 'Condo exterior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', caption: 'Rooftop pool', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800', caption: 'Full kitchen', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', caption: 'Master bedroom', isPrimary: false }
    ],
    price: 550,
    priceUnit: 'night',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 6,
    squareFeet: 1400,
    view: 'ocean',
    amenities: ['Rooftop Pool', 'Full Kitchen', 'Beach', 'WiFi', 'Concierge', 'Fitness Center'],
    features: ['Rooftop Pool', 'Full Kitchen', 'Downtown Location'],
    rating: 4.9,
    reviewCount: 789,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'Barrier Reef Drive', floor: 1 },
    coordinates: { lat: 17.9195, lng: -87.9558 }
  },
  {
    name: 'Grand Caribe Belize',
    type: 'Penthouse',
    description: 'Upscale beachfront resort with spacious condos and villas. Features multiple pools, full-service spa and salon, Rain Restaurant, and private pier. 2 miles north of San Pedro.',
    shortDescription: 'Upscale beachfront condos',
    images: [
      { url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', caption: 'Resort exterior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Multiple pools', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Spa & salon', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', caption: 'Luxury suite', isPrimary: false }
    ],
    price: 480,
    priceUnit: 'night',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 6,
    squareFeet: 1600,
    view: 'ocean',
    amenities: ['Multiple Pools', 'Full Spa', 'Salon', 'Restaurant', 'Beach', 'Private Pier', 'WiFi', 'Fitness Center'],
    features: ['Full Spa & Salon', 'Rain Restaurant', 'Private Pier'],
    rating: 4.7,
    reviewCount: 567,
    isAvailable: true,
    isFeatured: true,
    location: { building: '2 Miles North', floor: 1 },
    coordinates: { lat: 17.9378, lng: -87.9489 }
  },
  {
    name: 'SunBreeze Hotel',
    type: 'Suite',
    description: 'Popular beachfront hotel in downtown San Pedro featuring Blue Water Grill restaurant. Walking distance to shops, restaurants, and attractions. Perfect location for exploring the island.',
    shortDescription: 'Downtown beachfront hotel',
    images: [
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', caption: 'Hotel exterior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', caption: 'Beachfront', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Pool area', isPrimary: false }
    ],
    price: 220,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    squareFeet: 400,
    view: 'ocean',
    amenities: ['Pool', 'Restaurant', 'Beach', 'Dive Shop', 'WiFi', 'Airport Transfers'],
    features: ['Downtown Location', 'Blue Water Grill', 'Walking Distance to Town'],
    rating: 4.5,
    reviewCount: 678,
    isAvailable: true,
    isFeatured: false,
    location: { building: 'Coconut Drive', floor: 1 },
    coordinates: { lat: 17.9175, lng: -87.9569 }
  },
  {
    name: 'Alaia Belize, Autograph Collection',
    type: 'Suite',
    description: 'Marriott Autograph Collection luxury resort with modern architecture and beach chic aesthetic. Features Vista Rooftop Pool & Lounge, Sea Salt Restaurant, and full-service spa. South of San Pedro.',
    shortDescription: 'Marriott luxury resort',
    images: [
      { url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', caption: 'Modern architecture', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', caption: 'Rooftop pool', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', caption: 'Luxury room', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', caption: 'Beachfront', isPrimary: false }
    ],
    price: 450,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    squareFeet: 500,
    view: 'ocean',
    amenities: ['Rooftop Pool', 'Full Spa', 'Multiple Restaurants', 'Beach', 'Fitness Center', 'WiFi'],
    features: ['Marriott Bonvoy', 'Vista Rooftop', 'Sea Salt Restaurant'],
    rating: 4.6,
    reviewCount: 345,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'South Ambergris', floor: 1 },
    coordinates: { lat: 17.9023, lng: -87.9601 }
  },
  {
    name: 'The Watermark Belize Hotel',
    type: 'Suite',
    description: "New 70-room boutique hotel with rooftop pool and Skyview Lounge. Features Gusto's Mediterranean restaurant and spa services. Part of Muy'Ono Resorts. Tres Cocos area.",
    shortDescription: 'New boutique with rooftop pool',
    images: [
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', caption: 'Hotel exterior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', caption: 'Rooftop pool', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', caption: 'Modern room', isPrimary: false }
    ],
    price: 280,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    squareFeet: 400,
    view: 'ocean',
    amenities: ['Rooftop Pool', 'Restaurant', 'Spa', 'Gym', 'WiFi', 'Golf Cart Rental'],
    features: ['Skyview Lounge', "Gusto's Restaurant", "Muy'Ono Resorts"],
    rating: 4.5,
    reviewCount: 234,
    isAvailable: true,
    isFeatured: false,
    location: { building: 'Tres Cocos', floor: 1 },
    coordinates: { lat: 17.9267, lng: -87.9534 }
  },
  {
    name: 'Coco Beach Resort',
    type: 'Suite',
    description: 'Family-friendly resort with Spanish Colonial design. Features two large free-form pools with swim-up bar, water slide, and beachfront location. 3.5 miles north of San Pedro.',
    shortDescription: 'Family resort with pools',
    images: [
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', caption: 'Spanish colonial design', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Swim-up bar', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', caption: 'Beachfront', isPrimary: false }
    ],
    price: 320,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 4,
    squareFeet: 550,
    view: 'ocean',
    amenities: ['Multiple Pools', 'Swim-up Bar', 'Water Slide', 'Restaurant', 'Beach', 'Water Sports', 'WiFi'],
    features: ['Family Friendly', 'Swim-up Bar', 'Water Slide'],
    rating: 4.6,
    reviewCount: 456,
    isAvailable: true,
    isFeatured: false,
    location: { building: '3.5 Miles North', floor: 1 },
    coordinates: { lat: 17.9456, lng: -87.9445 }
  },
  {
    name: 'Blue Tang Inn',
    type: 'Suite',
    description: 'Charming boutique hotel with well-appointed rooms near downtown San Pedro. Features pool, complimentary breakfast, and friendly staff. Great value.',
    shortDescription: 'Charming downtown boutique',
    images: [
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', caption: 'Boutique exterior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Pool area', isPrimary: false }
    ],
    price: 180,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    squareFeet: 350,
    view: 'garden',
    amenities: ['Pool', 'Breakfast Included', 'Beach Access', 'WiFi'],
    features: ['Complimentary Breakfast', 'Downtown Location', 'Great Value'],
    rating: 4.6,
    reviewCount: 345,
    isAvailable: true,
    isFeatured: false,
    location: { building: 'San Pedro Town', floor: 1 },
    coordinates: { lat: 17.9201, lng: -87.9561 }
  },
  {
    name: 'Portofino Beach Resort',
    type: 'Cottage',
    description: 'Secluded boutique resort nestled among palm trees with beachside spa hut. Offers complimentary breakfast, snorkeling gear, and kayaks. 6 miles north of San Pedro.',
    shortDescription: 'Secluded boutique retreat',
    images: [
      { url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800', caption: 'Secluded beach', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Beachside spa', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Pool area', isPrimary: false }
    ],
    price: 350,
    priceUnit: 'night',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    squareFeet: 450,
    view: 'ocean',
    amenities: ['Pool', 'Beachside Spa', 'Restaurant', 'Beach', 'Snorkeling Gear', 'Kayaks', 'WiFi'],
    features: ['Secluded Location', 'Complimentary Breakfast', 'Water Sports Included'],
    rating: 4.5,
    reviewCount: 234,
    isAvailable: true,
    isFeatured: false,
    location: { building: '6 Miles North', floor: 1 },
    coordinates: { lat: 17.9634, lng: -87.9367 }
  }
];

// ============================================
// NIGHTLIFE - Real Ambergris Caye Bars/Clubs
// ============================================
const nightlife = [
  {
    name: "Jaguar's Temple Night Club",
    type: 'Nightclub',
    description: "San Pedro's most popular nightclub. The go-to spot after midnight when other venues close. Ladies free on Fridays. Dance floor with DJ spinning Latin, reggaeton, and dance hits.",
    shortDescription: "San Pedro's premier nightclub",
    images: [
      { url: 'https://images.unsplash.com/photo-1571266028243-d220c6a8b0b9?w=800', caption: 'Dance floor', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', caption: 'DJ booth', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', caption: 'Night vibes', isPrimary: false }
    ],
    priceRange: '$$',
    hours: 'Thu-Sat 10:00 PM - 3:00 AM',
    features: ['Dance Floor', 'DJ', 'Late Night', 'Ladies Night Fridays', 'VIP Area'],
    musicType: 'Latin, Reggaeton, Dance',
    dressCode: 'casual',
    minAge: 18,
    reservationRequired: false,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'Barrier Reef Drive', floor: 1 },
    coordinates: { lat: 17.9181, lng: -87.9569 }
  },
  {
    name: "Fido's Courtyard & Pier",
    type: 'Lounge',
    description: "San Pedro's oldest bar under the largest thatch palapa in Belize. Live entertainment nightly starting at 8 PM with different genres each night. A must-visit institution.",
    shortDescription: 'Iconic live music venue',
    images: [
      { url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800', caption: 'Giant palapa bar', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800', caption: 'Live music stage', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Waterfront setting', isPrimary: false }
    ],
    priceRange: '$$',
    hours: '11:00 AM - Midnight',
    features: ['Live Music Nightly', 'Waterfront', 'Large Palapa', 'Bar Food', 'Historic Venue'],
    musicType: 'Rock, Acoustic, 70s-80s',
    dressCode: 'casual',
    minAge: 18,
    reservationRequired: false,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'Barrier Reef Drive', floor: 1 },
    coordinates: { lat: 17.9185, lng: -87.9565 }
  },
  {
    name: 'Palapa Bar & Grill',
    type: 'Beach Bar',
    description: "Belize's original over-the-water bar. Float in inner tubes while enjoying drinks delivered via beer zip line. Famous for ceviche and rum punch. Live music daily.",
    shortDescription: 'Famous over-water bar',
    images: [
      { url: 'https://images.unsplash.com/photo-1528150230181-99bbf7b22162?w=800', caption: 'Over-water bar', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Inner tube floating', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Beer zip line', isPrimary: false }
    ],
    priceRange: '$$',
    hours: '11:00 AM - 10:00 PM',
    features: ['Over Water', 'Beer Zip Line', 'Inner Tubes', 'Live Music', 'Iconic Venue'],
    musicType: 'Reggae, Acoustic, Caribbean',
    dressCode: 'casual',
    minAge: 18,
    reservationRequired: false,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'Boca Del Rio', floor: 1 },
    coordinates: { lat: 17.9234, lng: -87.9545 }
  },
  {
    name: "Wayo's Beach Bar",
    type: 'Beach Bar',
    description: 'Salty overwater dive bar perfect for tropical cocktails like coconut mojitos. Great for shooting the breeze with new friends. Casual Caribbean vibes.',
    shortDescription: 'Casual overwater bar',
    images: [
      { url: 'https://images.unsplash.com/photo-1528150230181-99bbf7b22162?w=800', caption: 'Overwater deck', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Coconut mojitos', isPrimary: false }
    ],
    priceRange: '$$',
    hours: '11:00 AM - Midnight',
    features: ['Overwater', 'Coconut Mojitos', 'Casual Vibe', 'DJ/Live Music'],
    musicType: 'DJ, Caribbean',
    dressCode: 'casual',
    minAge: 18,
    reservationRequired: false,
    isAvailable: true,
    isFeatured: false,
    location: { building: 'Boca Del Rio', floor: 1 },
    coordinates: { lat: 17.9228, lng: -87.9549 }
  },
  {
    name: "Pedro's Club",
    type: 'Nightclub',
    description: 'Very popular Wednesday Ladies Night destination. DJ Debbie hosts dance competitions with prizes. Gets crowded around 11 PM. Ladies free, men $10 BZD with drink ticket.',
    shortDescription: 'Wednesday Ladies Night hot spot',
    images: [
      { url: 'https://images.unsplash.com/photo-1571266028243-d220c6a8b0b9?w=800', caption: 'Dance floor', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', caption: 'DJ Debbie', isPrimary: false }
    ],
    priceRange: '$',
    hours: 'Wednesday 9:00 PM - 2:00 AM',
    features: ['Ladies Night Wednesday', 'Dance Competitions', 'DJ Debbie', 'Drink Specials'],
    musicType: 'Latin, Dance',
    dressCode: 'casual',
    minAge: 18,
    reservationRequired: false,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'South San Pedro', floor: 1 },
    coordinates: { lat: 17.9145, lng: -87.9592 }
  },
  {
    name: 'Sunset Lounge',
    type: 'Rooftop Bar',
    description: 'Trendy rooftop spot with stunning sunset views above Sidelines Sports Bar. Popular with locals for Instagram-worthy sunset shots. Open Wednesday to Saturday.',
    shortDescription: 'Rooftop sunset views',
    images: [
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', caption: 'Rooftop views', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Sunset views', isPrimary: false }
    ],
    priceRange: '$$',
    hours: 'Wed-Sat 5:00 PM - Midnight',
    features: ['Rooftop', 'Sunset Views', 'Instagram Worthy', 'DJ', 'Trendy'],
    musicType: 'House, Lounge',
    dressCode: 'smart casual',
    minAge: 21,
    reservationRequired: false,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'Above Sidelines', floor: 2 },
    coordinates: { lat: 17.9176, lng: -87.9574 }
  },
  {
    name: "Crazy Canuck's Beach Bar",
    type: 'Beach Bar',
    description: 'Famous for hermit crab races on Thursday nights. Portion of proceeds goes to local school. Great Sunday jam sessions with live music.',
    shortDescription: 'Hermit crab races & jam sessions',
    images: [
      { url: 'https://images.unsplash.com/photo-1528150230181-99bbf7b22162?w=800', caption: 'Beach bar', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800', caption: 'Sunday jam', isPrimary: false }
    ],
    priceRange: '$$',
    hours: '10:00 AM - 10:00 PM',
    features: ['Hermit Crab Races Thursday', 'Sunday Jam', 'Charity Events', 'Beach Bar'],
    musicType: 'Live Bands, Jam Sessions',
    dressCode: 'casual',
    minAge: 18,
    reservationRequired: false,
    isAvailable: true,
    isFeatured: false,
    location: { building: 'South San Pedro', floor: 1 },
    coordinates: { lat: 17.9078, lng: -87.9601 }
  },
  {
    name: 'Sandy Toes Beach Bar & Grill',
    type: 'Beach Bar',
    description: 'Sandy beach bar with live music and DJs on weekends. Monday reggae jams are legendary. Perfect for casual drinks with feet in the sand.',
    shortDescription: 'Beach bar with reggae nights',
    images: [
      { url: 'https://images.unsplash.com/photo-1528150230181-99bbf7b22162?w=800', caption: 'Sandy beach bar', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Tropical drinks', isPrimary: false }
    ],
    priceRange: '$$',
    hours: '11:00 AM - 10:00 PM',
    features: ['Beachfront', 'Reggae Mondays', 'DJ Weekends', 'Live Music', 'Feet in Sand'],
    musicType: 'Reggae, Live Music, DJ',
    dressCode: 'casual',
    minAge: 18,
    reservationRequired: false,
    isAvailable: true,
    isFeatured: false,
    location: { building: 'North San Pedro', floor: 1 },
    coordinates: { lat: 17.9267, lng: -87.9534 }
  },
  {
    name: "Average Joe's",
    type: 'Lounge',
    description: 'Popular sports bar known for live band events, karaoke nights, and watching major sporting events on big screens.',
    shortDescription: 'Sports bar with live events',
    images: [
      { url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800', caption: 'Sports bar', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', caption: 'Big screens', isPrimary: false }
    ],
    priceRange: '$$',
    hours: '4:00 PM - Midnight',
    features: ['Sports TV', 'Live Bands', 'Karaoke', 'Pool Tables'],
    musicType: 'Live Bands, Karaoke',
    dressCode: 'casual',
    minAge: 18,
    reservationRequired: false,
    isAvailable: true,
    isFeatured: false,
    location: { building: 'South Ambergris', floor: 1 },
    coordinates: { lat: 17.9034, lng: -87.9605 }
  },
  {
    name: "Wahoo's Lounge",
    type: 'Beach Bar',
    description: 'Famous for Thursday night Chicken Drop game - bet on where the chicken will poop! Live music and DJ on weekends. Great food and drinks.',
    shortDescription: 'Famous Chicken Drop game',
    images: [
      { url: 'https://images.unsplash.com/photo-1528150230181-99bbf7b22162?w=800', caption: 'Beach lounge', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Tropical drinks', isPrimary: false }
    ],
    priceRange: '$$',
    hours: '11:00 AM - 11:00 PM',
    features: ['Chicken Drop Thursdays', 'Live Music', 'Games', 'Beachfront'],
    musicType: 'Live Music, DJ',
    dressCode: 'casual',
    minAge: 18,
    reservationRequired: false,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'Corona del Mar', floor: 1 },
    coordinates: { lat: 17.9012, lng: -87.9608 }
  },
  {
    name: 'Secret Beach',
    type: 'Beach Bar',
    description: 'Multiple beach bars on the lagoon side of the island. Full day experience with swimming in crystal clear water. Thursday through Sunday recommended. 40 minutes from San Pedro.',
    shortDescription: 'Beach bar district on lagoon',
    images: [
      { url: 'https://images.unsplash.com/photo-1528150230181-99bbf7b22162?w=800', caption: 'Crystal clear lagoon', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', caption: 'Beach clubs', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Lagoon views', isPrimary: false }
    ],
    priceRange: '$$$',
    hours: '10:00 AM - Sunset',
    features: ['Multiple Bars', 'Swimming', 'Beach Clubs', 'Day Trip Destination', 'Crystal Clear Water'],
    musicType: 'DJ, Reggae, Caribbean',
    dressCode: 'casual',
    minAge: 18,
    reservationRequired: false,
    isAvailable: true,
    isFeatured: true,
    location: { building: 'West Side', floor: 1 },
    coordinates: { lat: 17.9456, lng: -87.9823 }
  }
];

// ============================================
// WELLNESS ACTIVITIES - Real Ambergris Caye Spas
// ============================================
const wellnessActivities = [
  {
    name: 'The Sanctuary Spa',
    category: 'Wellness',
    description: 'Luxury spa at Mahogany Bay Resort with 8 coastal-inspired treatment rooms. Full range of massages, facials, and body treatments using local natural ingredients. Couples treatments available.',
    shortDescription: 'Luxury resort spa experience',
    images: [
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Treatment room', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', caption: 'Massage therapy', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', caption: 'Relaxation pool', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800', caption: 'Wellness garden', isPrimary: false }
    ],
    price: 180,
    duration: '90 minutes',
    skillLevel: 'all levels',
    maxParticipants: 2,
    included: ['Robe & Slippers', 'Refreshments', 'Pool Access', 'Natural Products'],
    requirements: [],
    isAvailable: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 234,
    coordinates: { lat: 17.8956, lng: -87.9612 }
  },
  {
    name: 'Black Orchid Spa',
    category: 'Wellness',
    description: 'Downtown day spa known for exceptional massage treatments. Popular coconut and peppermint body scrub followed by 90-minute massage. Handmade products.',
    shortDescription: 'Downtown massage specialists',
    images: [
      { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', caption: 'Massage therapy', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Treatment room', isPrimary: false }
    ],
    price: 120,
    duration: '90 minutes',
    skillLevel: 'all levels',
    maxParticipants: 2,
    included: ['Handmade Products', 'Aromatherapy', 'Relaxation Time'],
    requirements: [],
    isAvailable: true,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 189,
    coordinates: { lat: 17.9172, lng: -87.9576 }
  },
  {
    name: "Magda's Inspire Dream Spa",
    category: 'Wellness',
    description: 'Highly rated massage spa offering in-spa and mobile services. Known for strong, skilled therapists and relaxing atmosphere. Deep tissue specialty.',
    shortDescription: 'Mobile & in-spa massage',
    images: [
      { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', caption: 'Deep tissue massage', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Spa setting', isPrimary: false }
    ],
    price: 80,
    duration: '60 minutes',
    skillLevel: 'all levels',
    maxParticipants: 1,
    included: ['Mobile Service Available', 'Deep Tissue Expertise'],
    requirements: [],
    isAvailable: true,
    isFeatured: false,
    rating: 4.9,
    reviewCount: 156,
    coordinates: { lat: 17.9245, lng: -87.9538 }
  },
  {
    name: 'Grand Caribe Spa & Salon',
    category: 'Wellness',
    description: 'Full-service spa and salon at Grand Caribe resort. Offers massages, body treatments, facials, and full salon services. 50% deposit required.',
    shortDescription: 'Full spa & salon services',
    images: [
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Spa treatment', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800', caption: 'Salon services', isPrimary: false }
    ],
    price: 150,
    duration: '90 minutes',
    skillLevel: 'all levels',
    maxParticipants: 2,
    included: ['Full Menu Options', 'Salon Access', 'Resort Setting'],
    requirements: ['50% Deposit'],
    isAvailable: true,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 123,
    coordinates: { lat: 17.9378, lng: -87.9489 }
  },
  {
    name: 'Heavens Hair and Nails Salon',
    category: 'Wellness',
    description: 'Premier nail salon known for gel nails and detailed pedicures. Book in advance as services are in high demand. 3D nail art available.',
    shortDescription: 'Premier nail salon',
    images: [
      { url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800', caption: 'Nail services', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800', caption: 'Salon interior', isPrimary: false }
    ],
    price: 45,
    duration: '60 minutes',
    skillLevel: 'all levels',
    maxParticipants: 1,
    included: ['Gel Nails', 'Nail Art Options', 'Professional Service'],
    requirements: ['Advance Booking Recommended'],
    isAvailable: true,
    isFeatured: false,
    rating: 4.8,
    reviewCount: 234,
    coordinates: { lat: 17.9165, lng: -87.9582 }
  },
  {
    name: 'Victoria House Spa',
    category: 'Wellness',
    description: 'Full-service spa at Victoria House Resort offering massages, facials, and body treatments in a tranquil oceanfront setting.',
    shortDescription: 'Oceanfront resort spa',
    images: [
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Spa suite', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', caption: 'Massage therapy', isPrimary: false }
    ],
    price: 160,
    duration: '90 minutes',
    skillLevel: 'all levels',
    maxParticipants: 2,
    included: ['Oceanfront Setting', 'Full Menu', 'Premium Products'],
    requirements: [],
    isAvailable: true,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 178,
    coordinates: { lat: 17.9119, lng: -87.9583 }
  },
  {
    name: 'Matachica Spa',
    category: 'Wellness',
    description: 'Adults-only resort spa using local and natural ingredients. Peaceful setting with full range of treatments including couples options.',
    shortDescription: 'Adults-only natural spa',
    images: [
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Spa treatment', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800', caption: 'Natural setting', isPrimary: false }
    ],
    price: 175,
    duration: '90 minutes',
    skillLevel: 'all levels',
    maxParticipants: 2,
    included: ['Natural Ingredients', 'Adults Only', 'Romantic Setting'],
    requirements: ['Adults Only Resort'],
    isAvailable: true,
    isFeatured: false,
    rating: 4.8,
    reviewCount: 145,
    coordinates: { lat: 17.9589, lng: -87.9389 }
  }
];

// ============================================
// SEED FUNCTION
// ============================================
async function seedAmbergrisCaye() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('\n🗑️  Clearing existing data...');
    await Restaurant.deleteMany({});
    await Lodging.deleteMany({});
    await Nightlife.deleteMany({});
    await Activity.deleteMany({ category: 'Wellness' });
    
    console.log('🍽️  Seeding restaurants...');
    await Restaurant.insertMany(restaurants);
    
    console.log('🏠 Seeding lodging...');
    await Lodging.insertMany(lodgings);
    
    console.log('🌙 Seeding nightlife...');
    await Nightlife.insertMany(nightlife);
    
    console.log('💆 Seeding wellness activities...');
    await Activity.insertMany(wellnessActivities);
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ AMBERGRIS CAYE DATA SEEDED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    console.log('\n📊 Data Summary:');
    console.log(`   🍽️  Restaurants: ${restaurants.length} listings`);
    console.log(`   🏠 Lodging: ${lodgings.length} listings`);
    console.log(`   🌙 Nightlife: ${nightlife.length} listings`);
    console.log(`   💆 Wellness: ${wellnessActivities.length} listings`);
    console.log(`   📸 Total Images: ${
      restaurants.reduce((a, r) => a + r.images.length, 0) +
      lodgings.reduce((a, l) => a + l.images.length, 0) +
      nightlife.reduce((a, n) => a + n.images.length, 0) +
      wellnessActivities.reduce((a, w) => a + w.images.length, 0)
    }`);
    console.log(`   📍 All listings include GPS coordinates`);
    console.log('═'.repeat(60) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedAmbergrisCaye();