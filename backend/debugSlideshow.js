/**
 * DEBUG: Find where the old slideshow document is hiding
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

async function debug() {
  console.log('🔍 Searching for the phantom slideshow...\n');
  
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected\n');
  
  const db = mongoose.connection.db;
  
  // List all collections
  const collections = await db.listCollections().toArray();
  console.log('📁 ALL Collections:');
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`   - ${c.name}: ${count} documents`);
  }
  console.log('');
  
  // Search for slideshow in EVERY collection
  console.log('🔎 Searching for "homepage_slideshow" in all collections...\n');
  
  for (const c of collections) {
    const found = await db.collection(c.name).findOne({ key: 'homepage_slideshow' });
    if (found) {
      console.log(`✅ FOUND in "${c.name}":`);
      console.log(`   _id: ${found._id}`);
      console.log(`   First slide: "${found.slides?.[0]?.title}"`);
      console.log(`   linkType: ${found.slides?.[0]?.linkType}`);
      console.log('');
    }
    
    // Also search by the old ID
    try {
      const byId = await db.collection(c.name).findOne({ 
        _id: new mongoose.Types.ObjectId('693f80519062edcb6418b6fd') 
      });
      if (byId) {
        console.log(`⚠️  FOUND OLD ID in "${c.name}":`);
        console.log(`   key: ${byId.key}`);
        console.log(`   First slide: "${byId.slides?.[0]?.title}"`);
        console.log('');
      }
    } catch (e) {}
  }
  
  // Check the specific collection Mongoose uses
  console.log('📋 Checking "contents" collection directly:');
  const contents = await db.collection('contents').find({}).toArray();
  console.log(`   Total documents: ${contents.length}`);
  contents.forEach((doc, i) => {
    console.log(`   ${i+1}. key="${doc.key}", _id=${doc._id}`);
  });
  
  console.log('\n📋 Checking "content" collection (singular):');
  try {
    const content = await db.collection('content').find({}).toArray();
    console.log(`   Total documents: ${content.length}`);
    content.forEach((doc, i) => {
      console.log(`   ${i+1}. key="${doc.key}", _id=${doc._id}`);
    });
  } catch (e) {
    console.log('   Collection does not exist');
  }
  
  await mongoose.disconnect();
  console.log('\n✅ Done');
}

debug();
