# MOTA App - User Authentication Update

## 🚀 What's New in This Update

This update adds a complete **3-tier user authentication system** with **biometric login** support:

### User Access Levels
| Level | Access | Features |
|-------|--------|----------|
| **Guest** | Browse only | View restaurants, activities, events (read-only) |
| **Member** | Full engagement | Book restaurants, save favorites, RSVP events |
| **Investor** | Complete access | Dashboard, portfolio, documents, VIP benefits |

### Investor Tiers (Investment-Based)
| Tier | Threshold | Visibility |
|------|-----------|------------|
| Silver | Entry level | Always visible |
| Gold | $100,000+ | Always visible |
| Platinum | $250,000+ | Always visible |
| Diamond | $500,000+ | Always visible |
| Black | Invitation only | Hidden unless owned |
| Founders | Original investors | Hidden unless owned |

### New Features
- ✅ **Biometric Authentication** (Face ID / Fingerprint)
- ✅ **Bottom Sheet Modal** (non-disruptive sign-up)
- ✅ **FOMO Teasers** (tier upgrade prompts)
- ✅ **Tier Progress Display** (progress bar to next tier)
- ✅ **Investor Dashboard** (portfolio, ROI, benefits)
- ✅ **Investor Marketing View** (for non-investors)
- ✅ **Profile Screen** with security settings

---

## 📁 New Files Added

```
mota-app/
├── context/
│   └── AuthContext.tsx          # Auth state, user tiers, biometric service
├── components/
│   ├── BottomSheet.tsx          # Slide-up modal component
│   ├── AuthModal.tsx            # Sign up / Login form
│   └── FomoComponents.tsx       # FOMO banners, tier cards, progress
├── screens/
│   ├── InvestorScreen.tsx       # Marketing + Dashboard views
│   └── ProfileScreen.tsx        # User profile & settings
├── App.tsx                      # Updated main app (REPLACE EXISTING)
└── package.json                 # Updated dependencies (REPLACE EXISTING)
```

---

## 🔧 Installation Instructions

### Option 1: Manual File Copy (Recommended)

1. **Download all files** from this update package

2. **Create new folders** in your local repo:
   ```bash
   cd mota-app
   mkdir -p context components screens
   ```

3. **Copy files** to their respective folders:
   - `context/AuthContext.tsx` → `context/`
   - `components/BottomSheet.tsx` → `components/`
   - `components/AuthModal.tsx` → `components/`
   - `components/FomoComponents.tsx` → `components/`
   - `screens/InvestorScreen.tsx` → `screens/`
   - `screens/ProfileScreen.tsx` → `screens/`
   - `App.tsx` → root (replace existing)
   - `package.json` → root (replace existing)

4. **Install new dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

5. **Start the app**:
   ```bash
   npx expo start
   ```

### Option 2: Git Commands

```bash
# Navigate to your local repo
cd mota-app

# Create new folders
mkdir -p context components screens

# Copy files (assuming update files are in ~/Downloads/mota-github-update/)
cp ~/Downloads/mota-github-update/context/* ./context/
cp ~/Downloads/mota-github-update/components/* ./components/
cp ~/Downloads/mota-github-update/screens/* ./screens/
cp ~/Downloads/mota-github-update/App.tsx ./
cp ~/Downloads/mota-github-update/package.json ./

# Install dependencies
npm install

# Stage changes
git add .

# Commit
git commit -m "feat: Add 3-tier user auth system with biometric login

- Add AuthContext with Guest/Member/Investor access levels
- Add 6 investor tiers (Silver→Gold→Platinum→Diamond→Black→Founders)
- Add biometric authentication (Face ID/Fingerprint)
- Add bottom sheet modal for sign-up flow
- Add FOMO teasers and tier progression UI
- Add investor marketing view and dashboard
- Add profile screen with security settings"

# Push to GitHub
git push origin main
```

---

## 📦 New Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-local-authentication` | ~15.0.3 | Face ID / Fingerprint |
| `expo-secure-store` | ~14.0.1 | Encrypted credential storage |

---

## 🧪 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Member | member@mota.com | member123 |
| Silver Investor | silver@mota.com | silver123 |
| Gold Investor | gold@mota.com | gold123 |
| Platinum Investor | platinum@mota.com | plat123 |
| Diamond Investor | diamond@mota.com | diamond123 |
| Founders | founder@mota.com | founder123 |

---

## 🔐 Biometric Security Architecture

**Important:** Biometric data (face/fingerprint) is NEVER stored by the app or sent to any server.

```
┌──────────────────────────────────────────────────────────────┐
│                    DEVICE SECURE ENCLAVE                      │
│  • Face/fingerprint data stored here                         │
│  • Managed entirely by iOS/Android                           │
│  • MOTA app has ZERO access to this data                     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼ (success/failure only)
┌──────────────────────────────────────────────────────────────┐
│                    DEVICE KEYCHAIN/KEYSTORE                   │
│  • Encrypted auth token stored here                          │
│  • Unlocked only after biometric verification                │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼ (auth token only)
┌──────────────────────────────────────────────────────────────┐
│                       MOTA BACKEND                            │
│  • Validates auth token                                       │
│  • NEVER receives biometric data                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Flow Summary

1. **Guest → Member**: Free sign-up via bottom sheet modal (triggered by action)
2. **Member → Investor**: "Request Investor Deck" → Redirects to macauoftheamericas.com
3. **Investor Verification**: External process (24-72 hours)
4. **Tier Progression**: Based on investment amount

---

## ⚠️ Production Notes

Before going to production, replace the mock implementations:

1. **AuthContext.tsx**: Replace `mockUsers` and `mockPasswords` with actual API calls
2. **BiometricService**: Already uses real Expo APIs, just needs backend integration
3. **InvestorScreen**: Replace demo data with real portfolio API

---

## 📱 Testing Biometrics

- **iOS Simulator**: Hardware → Face ID → Enrolled, then use Hardware → Face ID → Matching Face
- **Android Emulator**: Extended Controls → Fingerprint
- **Physical Device**: Use actual biometrics

---

## 📄 License

MIT License - Praxium Labs
