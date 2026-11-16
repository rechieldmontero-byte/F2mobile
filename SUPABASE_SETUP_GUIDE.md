# Supabase Setup Guide for AgriHub

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project" or "New project"
3. Sign up or log in
4. Click "New project"
5. Fill in:
   - **Name**: AgriHub (or any name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you (e.g., Singapore for Philippines)
6. Click "Create new project"
7. Wait for project to be ready (1-2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy these two values:
   - **Project URL**: `https://iutjunvoctavctcfayes.supabase.co/rest/v1/`
   - **anon public** key: `sb_publishable_dFUrs9FOAaJJgqm3zst_rg_c0M8nCqP`

## Step 3: Create .env File

1. In your AgriHub project folder, create a file named `.env`
2. Add these lines (replace with your actual values):

```
EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

3. Save the file

## Step 4: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `C:\AgriHub\database.sql` in your code editor
4. Copy ALL the content from `database.sql`
5. Paste it into the Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message

## Step 5: Restart Expo Server

1. Stop the current Expo server (Ctrl+C in terminal)
2. Run again:
   ```bash
   npx expo start --web
   ```

## Step 6: Test Login

1. Open the app in browser
2. Click "Get Started" → "Create Account"
3. Fill in the form:
   - Full Name
   - **Account Type** (choose Buyer 🛒 or Seller 🚜)
   - Email
   - Password
   - Confirm Password
4. Click "Create Account"
5. You should be redirected to Home screen

**Note**: The profile will be auto-created in the `profiles` table with the selected account type.

## Account Types

### Buyer 🛒
- Can browse and purchase products
- Can save products
- Can view orders
- Sees standard Home screen with product recommendations

### Seller 🚜
- Can add products for sale
- Can manage orders
- Can view analytics
- Sees Seller Dashboard on Home screen with:
  - Add Product
  - My Orders
  - Analytics
- Farm Information section in Profile

## Testing Different Account Types

1. Create a Buyer account → check Home screen (no Seller Dashboard)
2. Create a Seller account → check Home screen (has Seller Dashboard)
3. Check Profile screen → should show account type badge (🛒 Buyer or 🚜 Seller)

## Troubleshooting

### Error: "Invalid API key"
- Make sure you copied the correct anon key (not the service_role key)
- Check that .env file is in the root of AgriHub folder
- Restart Expo server after adding .env

### Error: "relation does not exist"
- You didn't run the database.sql yet
- Go back to Step 4

### Error: "JWT expired"
- Supabase keys don't expire, but check if you copied them correctly

### Can't see products
- Check if you ran the INSERT statements in database.sql
- Go to **Table Editor** → **products** to verify data exists

## Database Tables Created

After running database.sql, you'll have:
- `products` - Product catalog
- `profiles` - User profiles (auto-created on signup)
- `orders` - User orders
- `order_items` - Order line items
- `saved_products` - User saved products

## Row Level Security (RLS)

The schema includes RLS policies:
- Products: Public read
- Profiles: Users can only read/update their own
- Orders: Users can only read/create their own
- Saved Products: Users can only manage their own

## Next Steps

Once login works:
1. Test creating an account
2. Browse products (should load from Supabase)
3. Save products (should sync to Supabase)
4. Check saved products persist after refresh
