# MOTA Backend v2 - MongoDB Edition

## 🚀 Quick Setup

### Option A: Use MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a free cluster (M0 - Free Tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/mota_db`)
6. Create a `.env` file in backend folder:

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/mota_db
JWT_SECRET=your-super-secret-key-here
```

7. Run:
```bash
npm install
npm start
```

### Option B: Install MongoDB Locally

1. Download MongoDB Community: https://www.mongodb.com/try/download/community
2. Install and run MongoDB
3. Run:
```bash
npm install
npm start
```

---

## 📍 Access Points

| URL | Description |
|-----|-------------|
| http://localhost:3001 | Admin Dashboard |
| http://localhost:3001/api | API Info |
| http://localhost:3001/api/restaurants | Restaurants |
| http://localhost:3001/api/activities | Activities |
| http://localhost:3001/api/events | Events |

---

## 🔐 Login Credentials

**Admin Dashboard:**
- Email: admin@mota.com
- Password: admin123

**Test Users:**
- member@mota.com / member123
- gold@mota.com / gold123
- platinum@mota.com / plat123
- diamond@mota.com / diamond123
- founder@mota.com / founder123

---

## 📊 Admin Dashboard Features

- **Overview**: Stats & metrics
- **Restaurants**: Full CRUD with tier pricing
- **Activities**: Full CRUD with tier pricing
- **Events**: Public & VIP events
- **Offers**: Promo codes & discounts
- **Users**: View, edit, upgrade to investor
- **Bookings**: View & manage all bookings

---

## 🗂️ API Endpoints

### Public
- `GET /api/restaurants`
- `GET /api/activities`
- `GET /api/events`
- `GET /api/offers`

### User Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Admin (Requires Token)
- `POST /api/admin/login`
- `GET /api/admin/stats`
- `GET/POST/PUT/DELETE /api/admin/restaurants`
- `GET/POST/PUT/DELETE /api/admin/activities`
- `GET/POST/PUT/DELETE /api/admin/events`
- `GET/POST/PUT/DELETE /api/admin/offers`
- `GET/PUT/DELETE /api/admin/users`
- `POST /api/admin/users/:id/upgrade-to-investor`
- `GET/PUT /api/admin/bookings`
