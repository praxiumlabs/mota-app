/**
 * Favorite Model
 * Favorites system with analytics for admin
 */

const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  itemType: {
    type: String,
    enum: ['restaurant', 'lodging', 'activity', 'event', 'nightlife', 'fleet'],
    required: true,
  },
  
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  
  // Denormalized data for quick access
  itemName: String,
  itemImage: String,
  itemCategory: String,
  itemRating: Number,
  
}, { timestamps: true });

// Compound unique index
FavoriteSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

// Analytics: Get all favorites grouped by category
FavoriteSchema.statics.getAnalytics = async function() {
  return this.aggregate([
    {
      $group: {
        _id: { itemType: '$itemType', itemId: '$itemId', itemName: '$itemName' },
        count: { $sum: 1 },
        users: { $push: '$user' },
      },
    },
    { $sort: { count: -1 } },
    {
      $group: {
        _id: '$_id.itemType',
        items: {
          $push: {
            itemId: '$_id.itemId',
            itemName: '$_id.itemName',
            favoriteCount: '$count',
            users: '$users',
          },
        },
        totalFavorites: { $sum: '$count' },
      },
    },
  ]);
};

// Get analytics for specific item
FavoriteSchema.statics.getItemAnalytics = async function(itemType, itemId) {
  const analytics = await this.aggregate([
    { $match: { itemType, itemId: new mongoose.Types.ObjectId(itemId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
    {
      $group: {
        _id: null,
        totalFavorites: { $sum: 1 },
        byAccessLevel: { $push: '$userDetails.accessLevel' },
        byInvestorTier: { $push: '$userDetails.investorTier' },
        recentUsers: {
          $push: {
            userId: '$userDetails._id',
            name: '$userDetails.name',
            favoritedAt: '$createdAt',
          },
        },
      },
    },
  ]);
  
  return analytics[0] || { totalFavorites: 0 };
};

module.exports = mongoose.model('Favorite', FavoriteSchema);
