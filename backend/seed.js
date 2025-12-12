/**
 * Database Seeder v3.1
 * Complete MOTA data with PCH Fleet, Notifications, Location
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Lodging = require('./models/Lodging');
const Restaurant = require('./models/Restaurant');
const Activity = require('./models/Activity');
const Event = require('./models/Event');
const Nightlife = require('./models/Nightlife');
const FundingRound = require('./models/FundingRound');
const Offer = require('./models/Offer');
const Content = require('./models/Content');
const ExoticFleet = require('./models/ExoticFleet');
const Notification = require('./models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mota';

// MOTA Location: Mahogany Bay, Belize
const MOTA_LOCATION = { lat: 17.898769, lng: -87.981777, address: 'Mahogany Bay, Ambergris Caye, Belize' };

const users = [
  { name: 'Guest User', email: 'guest@demo.com', password: 'demo123', accessLevel: 'guest' },
  { name: 'Demo Member', email: 'member@demo.com', password: 'demo123', accessLevel: 'member', phone: '+1 (555) 123-4567' },
  { name: 'Jordan Investor', email: 'investor@demo.com', password: 'demo123', accessLevel: 'investor', investorTier: 'gold', investmentAmount: 2500000, portfolioValue: 2750000 },
  { name: 'Alex Platinum', email: 'platinum@demo.com', password: 'demo123', accessLevel: 'investor', investorTier: 'platinum', investmentAmount: 15000000, portfolioValue: 16500000 },
  { name: 'Morgan Diamond', email: 'diamond@demo.com', password: 'demo123', accessLevel: 'investor', investorTier: 'diamond', investmentAmount: 70000000, portfolioValue: 77000000 },
];

const lodgings = [
  { name: 'Ocean View Suite', type: 'Suite', description: 'Wake up to breathtaking panoramic views of the Caribbean Sea. This luxurious 800 sq ft retreat features floor-to-ceiling windows, a private balcony with infinity views, premium king bedding, and marble bathroom with soaking tub.', shortDescription: 'Panoramic Caribbean views with private balcony', images: [{ url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', isPrimary: true }], price: 850, rating: 4.9, reviewCount: 127, bedrooms: 1, bathrooms: 1, maxGuests: 2, isFeatured: true },
  { name: 'Beachfront Villa', type: 'Villa', description: 'Experience ultimate privacy in our exclusive Beachfront Villa. Step directly onto pristine white sand from your private terrace. This 3,500 sq ft sanctuary features an infinity pool overlooking the Caribbean and full gourmet kitchen.', shortDescription: 'Private villa with beach access & infinity pool', images: [{ url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', isPrimary: true }], price: 2500, rating: 5.0, reviewCount: 89, dogFriendly: true, bedrooms: 3, bathrooms: 3, maxGuests: 6, isFeatured: true },
  { name: 'Garden Bungalow', type: 'Bungalow', description: 'Nestled within our lush tropical gardens, the Garden Bungalow offers a serene escape surrounded by native palms and exotic flowers. Features a private patio, outdoor rain shower, and hammock.', shortDescription: 'Tropical retreat in lush gardens', images: [{ url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', isPrimary: true }], price: 450, rating: 4.7, reviewCount: 203, dogFriendly: true, bedrooms: 1, bathrooms: 1, maxGuests: 2, isFeatured: true },
  { name: 'Presidential Penthouse', type: 'Penthouse', description: 'The crown jewel of MOTA accommodations. This 5,000 sq ft penthouse occupies the entire top floor with 360-degree views. Features private rooftop terrace with jacuzzi, home theater, wine cellar, and 24-hour butler.', shortDescription: '360° views with rooftop jacuzzi', images: [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', isPrimary: true }], price: 5000, rating: 5.0, reviewCount: 45, bedrooms: 4, bathrooms: 4, maxGuests: 8, isFeatured: true },
];

const restaurants = [
  { name: 'The Pearl', cuisine: 'Fine Dining', description: 'Our flagship restaurant has earned recognition as one of the Caribbean\'s premier dining destinations. Executive Chef Maria Santos crafts extraordinary tasting menus celebrating local Belizean ingredients with refined French techniques.', shortDescription: 'Award-winning Caribbean fine dining', images: [{ url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', isPrimary: true }], priceRange: '$$$$', rating: 4.9, reviewCount: 312, dressCode: 'formal', reservationRequired: true, isFeatured: true },
  { name: 'Jade Garden', cuisine: 'Asian Fusion', description: 'Experience the flavors of the Pacific Rim. Our culinary team artfully blends Japanese precision, Thai aromatics, and Chinese tradition. Watch master sushi chefs at work or dine on our serene garden terrace.', shortDescription: 'Contemporary Asian fusion', images: [{ url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', isPrimary: true }], priceRange: '$$$', rating: 4.8, reviewCount: 245, kidsFriendly: true, dressCode: 'smart casual', isFeatured: true },
  { name: 'The Steakhouse', cuisine: 'Steakhouse', description: 'A carnivore\'s paradise featuring the finest USDA Prime beef, dry-aged in-house for 45 days. Our wood-fired grill imparts the perfect char to hand-selected cuts. Extensive wine cellar with over 500 labels.', shortDescription: 'Prime dry-aged steaks & seafood', images: [{ url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', isPrimary: true }], priceRange: '$$$$', rating: 4.8, reviewCount: 198, kidsFriendly: true, dressCode: 'business casual', isFeatured: true },
  { name: 'Coconut Grove', cuisine: 'Caribbean', description: 'Toes in the sand, cocktail in hand. Savor jerk chicken, fresh ceviche, and grilled lobster while local musicians play under the palms. Open-air seating on the beach with spectacular sunset views.', shortDescription: 'Beachside Caribbean cuisine', images: [{ url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', isPrimary: true }], priceRange: '$$', rating: 4.7, reviewCount: 423, dogFriendly: true, kidsFriendly: true, dressCode: 'casual', isFeatured: true },
  { name: 'Bella Vista', cuisine: 'Italian', description: 'Authentic Italian cuisine crafted with passion. Every pasta is made fresh daily, pizzas emerge from our imported Neapolitan wood-fired oven. The terrace offers stunning views of the marina.', shortDescription: 'Authentic Italian with sunset views', images: [{ url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80', isPrimary: true }], priceRange: '$$$', rating: 4.6, reviewCount: 287, kidsFriendly: true, dressCode: 'smart casual', isFeatured: true },
];

const activities = [
  { name: 'Scuba Diving Adventure', category: 'Water Sports', description: 'Dive into the Belize Barrier Reef, a UNESCO World Heritage Site. Our PADI-certified instructors guide you through vibrant coral gardens and underwater caves.', shortDescription: 'Explore the Belize Barrier Reef', images: [{ url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', isPrimary: true }], price: 175, duration: '4 hours', rating: 4.9, reviewCount: 156, skillLevel: 'intermediate', isFeatured: true },
  { name: 'Sunset Sailing Cruise', category: 'Water Sports', description: 'Set sail aboard our 60-foot luxury catamaran as the Caribbean sun paints the sky. Enjoy an open bar, gourmet appetizers, and live acoustic music.', shortDescription: 'Luxury catamaran sunset experience', images: [{ url: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&q=80', isPrimary: true }], price: 125, duration: '3 hours', rating: 4.8, reviewCount: 234, skillLevel: 'all levels', isFeatured: true },
  { name: 'Mayan Ruins Expedition', category: 'Cultural', description: 'Journey through time to the ancient Mayan civilization. Visit Lamanai, one of Belize\'s most impressive archaeological sites, where pyramids rise from the jungle.', shortDescription: 'Explore ancient Mayan temples', images: [{ url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80', isPrimary: true }], price: 195, duration: 'Full Day', rating: 4.9, reviewCount: 189, skillLevel: 'all levels', isFeatured: true },
  { name: 'Spa & Wellness Retreat', category: 'Wellness', description: 'Indulge in a full day of rejuvenation at our world-class spa. Begin with a traditional Mayan clay body wrap, followed by a therapeutic massage using locally-sourced coconut oil.', shortDescription: 'Traditional Mayan spa treatments', images: [{ url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', isPrimary: true }], price: 350, duration: '6 hours', rating: 5.0, reviewCount: 98, skillLevel: 'all levels', isFeatured: true },
  { name: 'Deep Sea Fishing', category: 'Adventure', description: 'Board our fully-equipped 42-foot sport fishing vessel for an unforgettable day targeting marlin, sailfish, mahi-mahi, and tuna.', shortDescription: 'Big game fishing adventure', images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80', isPrimary: true }], price: 800, priceUnit: 'boat', duration: '8 hours', rating: 4.7, reviewCount: 67, skillLevel: 'all levels', isFeatured: true },
  { name: 'Jungle Zip Line', category: 'Adventure', description: 'Soar through the Belizean rainforest canopy on our world-class zip line course. Eight lines traverse over a mile of pristine jungle.', shortDescription: 'Rainforest canopy zip line', images: [{ url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80', isPrimary: true }], price: 95, duration: '3 hours', rating: 4.8, reviewCount: 312, minAge: 8, skillLevel: 'beginner', isFeatured: true },
];

const events = [
  { name: "New Year's Eve Gala 2026", description: 'Ring in 2026 at the most exclusive celebration in the Caribbean. Black-tie elegance with seven-course dinner, live orchestra, and fireworks over the Caribbean Sea.', shortDescription: 'Black-tie celebration with fireworks', images: [{ url: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80', isPrimary: true }], date: new Date('2025-12-31T20:00:00'), time: '8:00 PM - 2:00 AM', venue: 'Grand Ballroom', capacity: 500, category: 'Gala', dressCode: 'Black Tie', price: 500, accessLevel: 'member', isFeatured: true },
  { name: 'Wine & Jazz Evening', description: 'An evening of sophistication featuring premium wines paired with live jazz from the Marcus Roberts Trio.', shortDescription: 'Premium wines & live jazz', images: [{ url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80', isPrimary: true }], date: new Date('2025-12-20T19:00:00'), time: '7:00 PM - 11:00 PM', venue: 'The Pearl Restaurant', capacity: 80, category: 'Dining', dressCode: 'Smart Casual', price: 150, accessLevel: 'member', isFeatured: true },
  { name: 'Culinary Masterclass', description: 'Join Executive Chef Maria Santos for an intimate cooking experience. Learn the secrets behind The Pearl\'s signature dishes.', shortDescription: 'Cook with our executive chef', images: [{ url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80', isPrimary: true }], date: new Date('2025-12-15T14:00:00'), time: '2:00 PM - 5:00 PM', venue: 'Culinary Studio', capacity: 12, category: 'Dining', price: 200, accessLevel: 'member', isFeatured: true },
  { name: 'Investor Summit 2026', description: 'Annual gathering exclusively for MOTA investors. Comprehensive project updates, financial performance review, and networking.', shortDescription: 'Annual investor meeting', images: [{ url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', isPrimary: true }], date: new Date('2026-01-15T09:00:00'), time: '9:00 AM - 4:00 PM', venue: 'Executive Conference Center', capacity: 200, category: 'Investor', isFree: true, accessLevel: 'investor', isFeatured: true },
  { name: 'Sunset Yacht Party', description: 'Board our 120-foot luxury yacht for an unforgettable sunset cruise. Premium cocktails, gourmet canapés, and DJ entertainment.', shortDescription: 'Luxury yacht sunset cruise', images: [{ url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80', isPrimary: true }], date: new Date('2025-12-22T16:30:00'), time: '4:30 PM - 9:00 PM', venue: 'Marina - Yacht "Serenity"', capacity: 40, category: 'VIP', price: 350, accessLevel: 'investor', investorTierRequired: 'gold', isFeatured: true },
  { name: 'Full Moon Beach Party', description: 'Our legendary monthly celebration under the full moon. Dance barefoot on the sand with fire dancers, live DJ, and Caribbean rhythms.', shortDescription: 'Monthly full moon celebration', images: [{ url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80', isPrimary: true }], date: new Date('2025-12-25T20:00:00'), time: '8:00 PM - 1:00 AM', venue: 'Main Beach', capacity: 300, category: 'Entertainment', isFree: true, accessLevel: 'member', isFeatured: true },
];

const nightlife = [
  { name: 'Sky Lounge', type: 'Rooftop Bar', description: 'Perched atop the main tower, Sky Lounge offers 360-degree panoramic views. Our mixologists craft innovative cocktails while our resident DJ spins sophisticated lounge beats.', shortDescription: 'Rooftop cocktails with panoramic views', images: [{ url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80', isPrimary: true }], priceRange: '$$$', hours: '5:00 PM - 1:00 AM', features: ['360° Views', 'Craft Cocktails', 'Resident DJ'], musicType: 'Lounge/Deep House', dressCode: 'smart casual', isFeatured: true },
  { name: 'Eclipse Nightclub', type: 'Nightclub', description: 'The Caribbean\'s premier nightclub experience. State-of-the-art sound system, LED walls, and world-class DJs from Ibiza, Miami, and beyond.', shortDescription: 'World-class DJs and nightlife', images: [{ url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80', isPrimary: true }], priceRange: '$$$$', hours: '10:00 PM - 4:00 AM', features: ['International DJs', 'VIP Bottles', '3 Rooms'], musicType: 'EDM/House', dressCode: 'upscale', isFeatured: true },
  { name: 'The Rum Room', type: 'Speakeasy', description: 'Step through the hidden entrance into our 1920s-inspired speakeasy. Houses the Caribbean\'s largest collection of aged rums - over 300 varieties.', shortDescription: 'Hidden speakeasy with 300+ rums', images: [{ url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80', isPrimary: true }], priceRange: '$$$', hours: '7:00 PM - 2:00 AM', features: ['300+ Rums', 'Live Jazz', 'Hidden Entrance'], musicType: 'Jazz/Blues', dressCode: 'smart casual', isFeatured: true },
];

const exoticFleet = [
  { name: 'Lamborghini Huracán EVO', type: 'car', make: 'Lamborghini', model: 'Huracán EVO', year: 2024, description: 'Experience Italian excellence with this naturally-aspirated V10 supercar delivering 640 horsepower and reaching 60 mph in just 2.9 seconds.', shortDescription: 'V10 supercar, 640hp, 2.9s 0-60', pricePerDay: 1500, pricePerHour: 250, images: [{ url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80', isPrimary: true }], specs: { engine: '5.2L V10', horsepower: 640, topSpeed: '202 mph', acceleration: '2.9s' }, features: ['Carbon Ceramic Brakes', 'Launch Control'], isAvailable: true, isFeatured: true, accessLevel: 'investor', investorTierRequired: 'gold', rating: 5.0 },
  { name: 'Ferrari 488 Spider', type: 'car', make: 'Ferrari', model: '488 Spider', year: 2023, description: 'Breathtaking performance with open-air exhilaration. Twin-turbocharged V8 produces 661 horsepower while the retractable hardtop lets you feel the Caribbean breeze.', shortDescription: 'Twin-turbo V8 convertible, 661hp', pricePerDay: 1800, pricePerHour: 300, images: [{ url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80', isPrimary: true }], specs: { engine: '3.9L Twin-Turbo V8', horsepower: 661, topSpeed: '203 mph', acceleration: '3.0s' }, features: ['Retractable Hardtop', 'Carbon Fiber Interior'], isAvailable: true, isFeatured: true, accessLevel: 'investor', investorTierRequired: 'gold', rating: 5.0 },
  { name: 'Rolls-Royce Cullinan', type: 'car', make: 'Rolls-Royce', model: 'Cullinan Black Badge', year: 2024, description: 'The ultimate luxury SUV. Twin-turbo V12 delivers effortless power while cocooning you in handcrafted leather and rare wood veneers.', shortDescription: 'Ultra-luxury SUV, V12 power', pricePerDay: 2500, pricePerHour: 400, images: [{ url: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&q=80', isPrimary: true }], specs: { engine: '6.75L Twin-Turbo V12', horsepower: 600, topSpeed: '155 mph', acceleration: '4.8s' }, features: ['Starlight Headliner', 'Champagne Cooler'], isAvailable: true, isFeatured: true, accessLevel: 'investor', investorTierRequired: 'platinum', rating: 5.0 },
  { name: 'McLaren 720S', type: 'car', make: 'McLaren', model: '720S', year: 2023, description: 'British engineering at its finest. Carbon fiber monocoque chassis and twin-turbo V8 producing 710 horsepower. Track-ready performance, road-legal luxury.', shortDescription: 'Carbon fiber supercar, 710hp', pricePerDay: 1600, pricePerHour: 275, images: [{ url: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&q=80', isPrimary: true }], specs: { engine: '4.0L Twin-Turbo V8', horsepower: 710, topSpeed: '212 mph', acceleration: '2.8s' }, features: ['Dihedral Doors', 'Active Aero'], isAvailable: true, isFeatured: true, accessLevel: 'investor', investorTierRequired: 'gold', rating: 4.9 },
  { name: 'Bentley Continental GT', type: 'car', make: 'Bentley', model: 'Continental GT Speed', year: 2024, description: 'Grand touring perfection. 650hp W12 engine with sublime handcrafted luxury. Cruise the coastal highway in complete comfort.', shortDescription: 'W12 grand tourer, 650hp', pricePerDay: 1400, pricePerHour: 225, images: [{ url: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80', isPrimary: true }], specs: { engine: '6.0L W12 Twin-Turbo', horsepower: 650, topSpeed: '208 mph', acceleration: '3.5s' }, features: ['Naim Audio', 'Night Vision'], isAvailable: true, isFeatured: true, accessLevel: 'investor', investorTierRequired: 'gold', rating: 4.9 },
  { name: 'Serenity', type: 'yacht', length: '120ft', capacity: 40, description: 'Our flagship yacht is a 120-foot Sunseeker featuring five luxurious staterooms, an infinity pool, and a professional crew of eight. Perfect for sunset cruises or private events.', shortDescription: '120ft luxury yacht with infinity pool', pricePerDay: 15000, pricePerHour: 2500, images: [{ url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80', isPrimary: true }], specs: { cabins: 5, crew: 8, topSpeed: '28 knots' }, features: ['Infinity Pool', 'Full Bar', 'Jet Skis'], isAvailable: true, isFeatured: true, accessLevel: 'investor', investorTierRequired: 'platinum', rating: 5.0 },
  { name: 'Azure Dream', type: 'yacht', length: '85ft', capacity: 25, description: 'An elegant 85-foot Azimut perfect for day trips and intimate gatherings. Three staterooms, spacious flybridge, and dedicated crew.', shortDescription: '85ft Azimut for intimate cruising', pricePerDay: 8500, pricePerHour: 1500, images: [{ url: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&q=80', isPrimary: true }], specs: { cabins: 3, crew: 4, topSpeed: '32 knots' }, features: ['Flybridge', 'Snorkeling Gear', 'BBQ'], isAvailable: true, isFeatured: true, accessLevel: 'investor', investorTierRequired: 'gold', rating: 4.9 },
  { name: 'Reef Runner', type: 'yacht', length: '65ft', capacity: 18, description: 'High-performance 65-foot sport yacht for fishing excursions, reef trips, and fast island transfers. Full fishing gear and captain included.', shortDescription: '65ft sport yacht for fishing', pricePerDay: 5000, pricePerHour: 900, images: [{ url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', isPrimary: true }], specs: { cabins: 2, crew: 2, topSpeed: '38 knots' }, features: ['Fishing Gear', 'Livewell'], isAvailable: true, isFeatured: true, accessLevel: 'member', rating: 4.8 },
  { name: 'Island Time', type: 'yacht', length: '55ft', capacity: 12, description: 'Beautiful 55-foot catamaran for stable, comfortable sailing. Ideal for sunset sails, snorkeling trips, and romantic getaways.', shortDescription: '55ft catamaran for sailing', pricePerDay: 3500, pricePerHour: 600, images: [{ url: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&q=80', isPrimary: true }], specs: { cabins: 4, crew: 2, topSpeed: '12 knots' }, features: ['Trampolines', 'Paddleboards', 'BBQ'], isAvailable: true, isFeatured: true, accessLevel: 'member', rating: 4.9 },
];

const fundingRounds = [
  { phase: 1, name: 'Infrastructure Development', period: '2023-2025', startDate: new Date('2023-01-01'), endDate: new Date('2025-12-31'), targetAmount: 50000000, raisedAmount: 50000000, status: 'completed', milestones: [{ name: 'Site Acquisition', status: 'completed', progress: 100 }, { name: 'Permits & Approvals', status: 'completed', progress: 100 }] },
  { phase: 2, name: 'Mahogany Bay Resort', period: '2026-2028', startDate: new Date('2026-01-01'), endDate: new Date('2028-12-31'), targetAmount: 250000000, raisedAmount: 87500000, status: 'active', minimumInvestment: 2500000, milestones: [{ name: 'Ground Breaking', status: 'completed', progress: 100 }, { name: 'Foundation', status: 'in_progress', progress: 35 }], dividendSchedule: { frequency: 'quarterly', startDate: new Date('2031-01-01'), projectedAmount: 864000 } },
  { phase: 3, name: 'Secret Beach Development', period: '2027-2031', startDate: new Date('2027-01-01'), targetAmount: 400000000, raisedAmount: 0, status: 'upcoming' },
  { phase: 4, name: 'Crown Jewel Casino Resort', period: '2031-2035', startDate: new Date('2031-01-01'), targetAmount: 750000000, raisedAmount: 0, status: 'upcoming' },
  { phase: 5, name: 'Full Destination Launch', period: '2036-2045', startDate: new Date('2036-01-01'), targetAmount: 500000000, raisedAmount: 0, status: 'upcoming' },
];

const contentData = [
  {
    key: 'homepage_slideshow',
    slides: [
      { title: 'Welcome to Paradise', subtitle: 'MOTA Resort & Casino', description: 'Experience the ultimate luxury destination on the Caribbean coast of Belize', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80', buttonText: 'Explore', buttonLink: '/explore', order: 0, isActive: true },
      { title: 'Exquisite Dining', subtitle: 'World-Class Cuisine', description: 'From Caribbean flavors to international fine dining, savor every moment', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80', buttonText: 'View Restaurants', buttonLink: '/restaurants', order: 1, isActive: true },
      { title: 'Unforgettable Events', subtitle: 'Exclusive Experiences', description: 'Join us for galas, concerts, and VIP gatherings under the Caribbean stars', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80', buttonText: 'See Events', buttonLink: '/events', order: 2, isActive: true },
      { title: 'Adventure Awaits', subtitle: 'Discover Belize', description: 'Explore ancient ruins, dive the barrier reef, and soar through the jungle', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80', buttonText: 'View Activities', buttonLink: '/activities', order: 3, isActive: true },
      { title: 'Invest in Paradise', subtitle: 'Become a Partner', description: 'Join our exclusive investment opportunity and own a piece of the Caribbean', imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80', buttonText: 'Learn More', buttonLink: '/invest', order: 4, isActive: true }
    ]
  },
  { key: 'homepage_welcome', title: 'Welcome to MOTA', subtitle: 'Macau of the Americas', body: 'MOTA is an extraordinary luxury destination being developed on the beautiful coast of Belize. Combining world-class gaming, premium hospitality, and exclusive investment opportunities, MOTA represents a new standard in Caribbean luxury.' },
  { key: 'about_resort', title: 'About MOTA Resort', subtitle: 'The Ultimate Destination', body: 'Set on pristine Caribbean beaches at Mahogany Bay, MOTA Resort & Casino offers an unparalleled blend of luxury accommodations, world-class dining, exciting entertainment, and exclusive gaming experiences.', data: { established: '2023', location: 'Ambergris Caye, Belize', coordinates: MOTA_LOCATION, totalInvestment: '$2B+', completion: '2045' } },
  { key: 'contact_info', title: 'Contact Us', data: { email: 'concierge@motaresort.com', investorRelations: 'investors@motaresort.com', phone: '+1 (888) MOTA-BZE', address: 'Mahogany Bay, Ambergris Caye, Belize', coordinates: MOTA_LOCATION } },
  { key: 'app_settings', data: { primaryColor: '#C9A962', secondaryColor: '#1A1A2E', logoUrl: '/assets/logo.png', currency: 'USD', timezone: 'America/Belize' } }
];

const notifications = [
  { targetType: 'all', title: '🌴 Welcome to MOTA!', message: 'Thank you for joining us. Explore our world-class amenities, exclusive events, and investment opportunities.', type: 'info', status: 'sent', sentAt: new Date() },
  { targetType: 'investors', title: '📊 Q4 Investment Update', message: 'Your quarterly portfolio statement is now available. Log in to view your returns and upcoming dividend schedule.', type: 'info', status: 'sent', sentAt: new Date() },
  { targetType: 'gold', title: '🎉 Exclusive Gold Member Event', message: 'You\'re invited to the Sunset Yacht Party on December 22nd. RSVP now to secure your spot!', type: 'event', status: 'sent', sentAt: new Date() },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('\n🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}), Lodging.deleteMany({}), Restaurant.deleteMany({}), Activity.deleteMany({}),
      Event.deleteMany({}), Nightlife.deleteMany({}), FundingRound.deleteMany({}), Offer.deleteMany({}),
      Content.deleteMany({}), ExoticFleet.deleteMany({}), Notification.deleteMany({})
    ]);
    
    console.log('👥 Seeding users...');
    for (const u of users) { const user = new User(u); await user.save(); }
    
    console.log('🏠 Seeding lodging...');
    await Lodging.insertMany(lodgings);
    
    console.log('🍽️  Seeding restaurants...');
    await Restaurant.insertMany(restaurants);
    
    console.log('🏄 Seeding activities...');
    await Activity.insertMany(activities);
    
    console.log('🎉 Seeding events...');
    await Event.insertMany(events);
    
    console.log('🌙 Seeding nightlife...');
    await Nightlife.insertMany(nightlife);
    
    console.log('💰 Seeding funding rounds...');
    await FundingRound.insertMany(fundingRounds);
    
    console.log('📄 Seeding content...');
    await Content.insertMany(contentData);
    
    console.log('🚗 Seeding PCH Exotic Fleet...');
    await ExoticFleet.insertMany(exoticFleet);
    
    console.log('🔔 Seeding notifications...');
    await Notification.insertMany(notifications);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📱 Demo Accounts:');
    console.log('   guest@demo.com / demo123');
    console.log('   member@demo.com / demo123');
    console.log('   investor@demo.com / demo123 (Gold)');
    console.log('   platinum@demo.com / demo123 (Platinum)');
    console.log('   diamond@demo.com / demo123 (Diamond)');
    console.log('\n🚗 PCH Fleet: 5 Cars, 4 Yachts');
    console.log('='.repeat(50) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
