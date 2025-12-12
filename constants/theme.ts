/**
 * Theme Constants
 * Colors and gradients for MOTA app
 */

// Color Palette
export const C = {
  bg: '#0A122A',
  card: '#101C40',
  cardLight: '#152347',
  gold: '#D4AF37',
  goldLight: '#E8C547',
  goldDark: '#B8952F',
  goldMuted: 'rgba(212,175,55,0.15)',
  text: '#F5F5F5',
  textSec: '#A0AEC0',
  textMuted: '#718096',
  success: '#48BB78',
  error: '#FC8181',
  blue: '#4299E1',
  white: '#FFFFFF',
};

// Gradients
export const G = {
  gold: ['#E8C547', '#D4AF37', '#B8952F'] as const,
  dark: ['#101C40', '#0A122A'] as const,
  card: ['#152347', '#101C40'] as const,
  overlay: ['transparent', 'rgba(10,18,42,0.3)', 'rgba(10,18,42,0.85)'] as const,
  platinum: ['#E8E8E8', '#E5E4E2', '#D4D4D4'] as const,
  diamond: ['#E0F7FA', '#B9F2FF', '#81D4FA'] as const,
};

// Investor Tiers
export const InvestorTiers = [
  { 
    id: 'gold', 
    name: 'Gold', 
    investment: '$2.5M', 
    color: C.gold, 
    gradient: G.gold,
    benefits: [
      'Phase 2 Investment Access',
      'Complimentary chips: $50K annually',
      '7 complimentary nights per year',
      '2 business-class plane tickets annually',
      'Priority reservations & concierge',
      'Exclusive event access',
      'Flexible credit line of $2,500,000'
    ]
  },
  { 
    id: 'platinum', 
    name: 'Platinum', 
    investment: '$15M', 
    color: '#E5E4E2', 
    gradient: G.platinum,
    benefits: [
      'All Gold benefits plus:',
      'Complimentary chips: $300K annually',
      '30 complimentary nights per year',
      'Private jet access (shared)',
      'VIP gaming floor access',
      'Personal account manager',
      'Flexible credit line of $15,000,000'
    ]
  },
  { 
    id: 'diamond', 
    name: 'Diamond', 
    investment: '$70M', 
    color: '#B9F2FF', 
    gradient: G.diamond,
    benefits: [
      'All Platinum benefits plus:',
      'Complimentary chips: $1.4M annually',
      '90+ complimentary nights per year',
      'Dedicated private aircraft',
      'Resort ownership privileges',
      '24/7 dedicated concierge team',
      'Flexible credit line of $70,000,000'
    ]
  },
];

// Investment Timeline
export const InvestmentTimeline = [
  { phase: 1, name: 'Infrastructure Development', period: '2023-2025', status: 'completed' },
  { phase: 2, name: 'Mahogany Bay Resort', period: '2026-2028', status: 'current', amount: '$10,000,000' },
  { phase: 3, name: 'Secret Beach Development', period: '2027-2031', status: 'upcoming' },
  { phase: 4, name: 'Crown Jewel Casino Resort', period: '2031-2035', status: 'upcoming' },
  { phase: 5, name: 'Full Destination Launch', period: '2036-2045', status: 'upcoming' },
];

// MOTA Location
export const MOTA_LOCATION = {
  lat: 17.898769,
  lng: -87.981777,
  address: 'Mahogany Bay, Ambergris Caye, Belize',
  country: 'Belize'
};

// Placeholder image for failed loads
export const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=60';
