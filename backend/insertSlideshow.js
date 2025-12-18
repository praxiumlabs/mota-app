/**
 * FRESH INSERT: Create new slideshow document
 * 
 * USAGE: node insertSlideshow.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

console.log('Using MONGO_URI:', MONGO_URI?.substring(0, 50) + '...\n');

const correctSlides = [
  {
    title: 'Luxury Retreats',
    subtitle: 'WHERE PARADISE MEETS PERFECTION',
    description: 'World-class accommodations with breathtaking Caribbean views',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    buttonText: 'Explore Lodging',
    linkType: 'tab',
    linkTarget: 'Lodging',
    linkTab: 1,
    order: 0,
    isActive: true
  },
  {
    title: 'World-Class Gaming',
    subtitle: 'THE ULTIMATE ENTERTAINMENT',
    description: 'Premier casino experience with exclusive VIP lounges',
    imageUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=1200&q=80',
    buttonText: 'View Nightlife',
    linkType: 'tab',
    linkTarget: 'Nightlife',
    linkTab: 1,
    order: 1,
    isActive: true
  },
  {
    title: 'Adventure Awaits',
    subtitle: 'EXPLORE THE UNTAMED BEAUTY',
    description: 'From pristine beaches to lush jungles, discover Belize',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
    buttonText: 'Discover Experiences',
    linkType: 'tab',
    linkTarget: 'Experiences',
    linkTab: 1,
    order: 2,
    isActive: true
  },
  {
    title: 'Exquisite Dining',
    subtitle: 'A FEAST FOR THE SENSES',
    description: 'Exquisite cuisines crafted by world-renowned chefs',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    buttonText: 'Browse Restaurants',
    linkType: 'tab',
    linkTarget: 'Eateries',
    linkTab: 1,
    order: 3,
    isActive: true
  },
  {
    title: 'Unforgettable Events',
    subtitle: 'WHERE THE NIGHT COMES ALIVE',
    description: 'Exclusive clubs, lounges, and entertainment venues',
    imageUrl: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1200&q=80',
    buttonText: 'View Events',
    linkType: 'tab',
    linkTarget: null,
    linkTab: 2,
    order: 4,
    isActive: true
  }
];

async function insertSlideshow() {
  console.log('📝 Inserting fresh slideshow...\n');
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log('   Database:', mongoose.connection.db.databaseName);
    console.log('   Host:', mongoose.connection.host);
    console.log('');
    
    const db = mongoose.connection.db;
    const collection = db.collection('contents');
    
    // Step 1: Delete ALL existing slideshows
    console.log('🗑️  Removing any existing slideshows...');
    const deleteResult = await collection.deleteMany({ key: 'homepage_slideshow' });
    console.log(`   Deleted: ${deleteResult.deletedCount} document(s)\n`);
    
    // Step 2: Insert fresh document
    console.log('✨ Inserting new slideshow...');
    const insertResult = await collection.insertOne({
      key: 'homepage_slideshow',
      slides: correctSlides,
      images: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('   Inserted ID:', insertResult.insertedId);
    console.log('');
    
    // Step 3: Verify it's there
    console.log('🔍 Verifying...');
    const doc = await collection.findOne({ key: 'homepage_slideshow' });
    
    if (doc) {
      console.log('✅ Document found!\n');
      console.log('   _id:', doc._id);
      console.log('   key:', doc.key);
      console.log('   slides:', doc.slides.length);
      console.log('');
      
      console.log('📋 Slides:');
      doc.slides.forEach((s, i) => {
        console.log(`   ${i+1}. "${s.title}" → linkType: ${s.linkType}, linkTab: ${s.linkTab}`);
      });
    } else {
      console.log('❌ Document NOT found after insert!');
    }
    
    // Step 4: Count total documents in contents
    const totalCount = await collection.countDocuments();
    console.log(`\n📊 Total documents in 'contents' collection: ${totalCount}`);
    
    console.log('\n' + '═'.repeat(50));
    console.log('✅ DONE!');
    console.log('═'.repeat(50));
    console.log('\n🚨 IMPORTANT NEXT STEPS:');
    console.log('');
    console.log('   1. STOP your backend server (Ctrl+C)');
    console.log('   2. STOP ngrok (Ctrl+C)');
    console.log('   3. START backend: node server.js');
    console.log('   4. START ngrok: ngrok http 5000');
    console.log('   5. UPDATE your app with NEW ngrok URL');
    console.log('   6. Test API in browser first!');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

insertSlideshow();
