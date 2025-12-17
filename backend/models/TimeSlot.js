/**
 * TimeSlot Model
 * Availability slots for reservations
 */

const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['restaurant', 'activity', 'fleet'],
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  
  date: {
    type: Date,
    required: true,
  },
  
  time: {
    type: String,
    required: true,
  },
  
  totalCapacity: {
    type: Number,
    default: 10,
  },
  bookedCount: {
    type: Number,
    default: 0,
  },
  
  isAvailable: {
    type: Boolean,
    default: true,
  },
  
  priceModifier: {
    type: Number,
    default: 1.0,
  },
  
}, { timestamps: true });

TimeSlotSchema.index({ itemType: 1, itemId: 1, date: 1 });
TimeSlotSchema.index({ date: 1, time: 1 });

TimeSlotSchema.virtual('spotsLeft').get(function() {
  return Math.max(0, this.totalCapacity - this.bookedCount);
});

TimeSlotSchema.methods.isSlotAvailable = function() {
  return this.isAvailable && this.spotsLeft > 0;
};

TimeSlotSchema.set('toJSON', { virtuals: true });
TimeSlotSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TimeSlot', TimeSlotSchema);
