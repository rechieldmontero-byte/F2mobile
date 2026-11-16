# AgriHub Technology Stack

## Overview
AgriHub is a React Native mobile application for agricultural products marketplace.

## Technologies Used

### 1. React Native
- **Purpose**: Mobile application interface
- **Usage**: Core framework for building cross-platform mobile app (iOS/Android/Web)
- **Location**: `app.js`, `screens/*.js`

### 2. React Navigation
- **Purpose**: Navigation between screens
- **Usage**: Stack navigator for screen transitions
- **Location**: `app.js` (NavigationContainer, Stack.Navigator)
- **Features**:
  - Stack navigation
  - Screen transitions
  - Route parameters

### 3. Supabase
- **Purpose**: Main database for AgriHub
- **Usage**: PostgreSQL database with real-time capabilities
- **Location**: `lib/supabase.js`, `services/supabaseService.js`
- **Features**:
  - User authentication (email/password)
  - Product catalog storage
  - User profiles
  - Orders management
  - Saved products (cloud sync)
  - Row Level Security (RLS)

### 4. External API
- **Purpose**: Fetching external agricultural product data
- **Usage**: API layer for product listings
- **Location**: `api/products.js`
- **Features**:
  - Product fetching
  - Category filtering
  - Mock data fallback
  - Loading/error states

### 5. AsyncStorage
- **Purpose**: Local storage for selected products (offline fallback)
- **Usage**: Local persistence when not logged in or offline
- **Location**: `services/savedProducts.js`
- **Features**:
  - Saved products storage
  - Quantity management
  - Offline capability
  - Fallback when Supabase unavailable

## Architecture

```
┌─────────────────────────────────────┐
│         React Native App            │
│  ┌───────────────────────────────┐  │
│  │     React Navigation          │  │
│  │  (Stack Navigator)            │  │
│  └───────────────────────────────┘  │
│           │                         │
│  ┌────────┴────────┐               │
│  │                 │               │
│  ▼                 ▼               │
│ ┌──────────┐  ┌──────────────┐    │
│ │Screens   │  │  Services    │    │
│ │(UI Layer)│  │(Business     │    │
│ │          │  │ Logic)       │    │
│ └──────────┘  └──────────────┘    │
│        │              │            │
│        │    ┌─────────┴─────────┐  │
│        │    │                   │  │
│        │    ▼                   ▼  │
│        │ ┌──────────┐    ┌────────┐│
│        │ │Supabase  │    │Async   ││
│        │ │(Cloud DB)│    │Storage ││
│        │ └──────────┘    └────────┘│
│        │                         │
│        └─────────────────────────┘
│                                     │
│  ┌───────────────────────────────┐  │
│  │     External API              │  │
│  │  (Product Data Source)        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Data Flow

### Product Browsing
1. User opens Explore screen
2. App calls `fetchProducts()` from `api/products.js`
3. API tries Supabase first via `services/supabaseService.js`
4. If Supabase fails/unavailable, falls back to mock data
5. Products displayed with loading/error states

### User Authentication
1. User enters credentials in Login/Create Account screen
2. App calls `signIn()` or `signUp()` from `services/supabaseService.js`
3. Supabase handles authentication
4. On success, user is redirected to Home screen
5. User session persisted by Supabase

### Saved Products
1. User taps "Save Product" on Product Detail screen
2. App calls `saveProduct()` from `services/savedProducts.js`
3. Service checks if user is logged in
4. If logged in: saves to Supabase `saved_products` table
5. If not logged in: saves to AsyncStorage (local)
6. Saved products sync across devices when logged in

### Orders
1. User adds products to cart
2. App calls `createOrder()` from `services/supabaseService.js`
3. Order saved to Supabase `orders` table
4. User can view orders in Orders screen

## File Structure

```
AgriHub/
├── app.js                          # Main app entry & navigation
├── index.js                        # Expo entry point
├── package.json                    # Dependencies
├── .env.example                    # Environment variables template
├── SUPABASE_SETUP.md              # Database schema documentation
├── TECH_STACK.md                   # This file
│
├── lib/
│   └── supabase.js                # Supabase client configuration
│
├── services/
│   ├── supabaseService.js         # Supabase operations (auth, products, orders)
│   └── savedProducts.js           # Saved products (Supabase + AsyncStorage fallback)
│
├── api/
│   └── products.js                # Product API (Supabase + mock fallback)
│
├── screens/
│   ├── WelcomeScreen.js           # Welcome/Login landing
│   ├── LoginScreen.js             # User login
│   ├── CreateAccountScreen.js     # User registration
│   ├── HomeScreen.js              # Home dashboard
│   ├── ExploreScreen.js           # Product browsing
│   ├── ProductListScreen.js       # Category product listing
│   ├── ProductDetailScreen.js     # Product details
│   ├── SavedProductsScreen.js     # Saved products management
│   ├── ActivityScreen.js          # Activity feed
│   ├── OrdersScreen.js            # User orders
│   ├── AddScreen.js               # Add new listing
│   ├── ToolsScreen.js             # Farm tools
│   └── ProfileScreen.js           # User profile
│
└── assets/
    └── logo.png                   # App logo
```

## Environment Setup

### 1. Supabase Setup
1. Create project at https://supabase.com
2. Run SQL from `SUPABASE_SETUP.md` to create tables
3. Copy URL and anon key to `.env` file:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 2. External API Setup
- Currently using mock data in `api/products.js`
- Can be replaced with real API endpoint
- Supports category filtering and error handling

### 3. AsyncStorage
- No setup required
- Automatically works as fallback for saved products
- Persists locally on device

## Key Features

✅ User authentication (Supabase)
✅ Product catalog with categories
✅ Product search and filtering
✅ Saved products with quantity management
✅ Offline support (AsyncStorage fallback)
✅ Order management
✅ User profiles
✅ Responsive design (Web/iOS/Android)
✅ Loading and error states
✅ Pull-to-refresh
✅ Local persistence
✅ Cloud sync (when logged in)

## Future Enhancements

- Real-time product updates (Supabase Realtime)
- Push notifications
- Image uploads for products
- Payment integration
- Chat/messaging
- Reviews and ratings
- Analytics dashboard
