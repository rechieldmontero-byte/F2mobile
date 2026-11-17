# AgriHub Business Model

AgriHub kay usa ka **agricultural marketplace** nga nag-hubli sa mga farmers/sellers ug buyers. Mao ni ang business model:

## Revenue Streams

### 1. Commission sa Matag Order (Transaction Fee)
- **Unsa:** Tanginggam ang AgriHub og % sa matag successful order (e.g., 5-10%)
- **Kinsa ang mobayad:** Seller o buyer — kasagaran seller
- **Unsaon pag-implement:** I-deduct ang commission gikan sa seller payout; i-track sa `orders` table ang `commission_amount`
- **Example:** Order ₱1,000 → commission 8% = ₱80 para sa AgriHub

### 2. Featured/Promoted Listings (Advertising)
- **Unsa:** Seller makabayad para ipadayag ang ilang products sa "Best Sellers" o top sa Explore
- **Kinsa ang mobayad:** Sellers nga gusto og mas daghan og exposure
- **Unsaon pag-implement:** `products` table — `is_featured` column; subscription tiers (₱299/bulan, ₱599/bulan)

### 3. Premium Seller Subscription
- **Unsa:** Monthly subscription para sa advanced seller tools
- **Features:**
  - Analytics dashboard (sales reports, top products)
  - Unlimited product listings (free tier limited sa 10)
  - Priority customer support
  - Verified seller badge
- **Pricing:** ₱499/month o ₱4,999/year
- **Unsaon pag-implement:** `subscriptions` table; check sa AddScreen kung na-limit ang listings

### 4. Buyer Protection / Escrow Service Fee (Future)
- **Unsa:** Optional fee para sa secure payment holding (money held until delivery confirmed)
- **Kinsa ang mobayad:** Buyers nga gusto og protection
- **Pricing:** 1-2% sa order total

### 5. Logistics/Delivery Partnerships (Future)
- **Unsa:** Commission gikan sa delivery partners (Lalamove, Flash Express, etc.)
- **Kinsa ang mobayad:** Delivery companies o shared revenue
- **Unsaon pag-implement:** `deliveries` table; integrate delivery API

## Cost Structure

| Cost | Monthly Estimate |
|------|-----------------|
| Supabase (database + auth) | Free tier → $25/mo |
| EAS Build (app builds) | Free tier limited |
| Hosting (GitHub Pages) | Free |
| Payment gateway fees | 2-3% per transaction (PayMongo/Stripe) |
| Marketing | Variable |

## Target Market

- **Primary:** Small-scale farmers ug food producers sa Philippines
- **Secondary:** Restaurants, groceries, households nga mopalit og fresh produce
- **Geography:** Sugdan sa Visayas/Mindanao, dayon palapdan sa tibuok PH

## Competitive Advantage

1. **Direct farm-to-table** — walay middlemen, cheaper prices
2. **Local focus** — suporta sa Filipino language ug local payment methods (GCash, Maya, COD)
3. **Community features** — group buying, auctions, requests (demand aggregation)
4. **Verified sellers** — trust ug quality assurance

## Growth Strategy

1. **Phase 1 (Launch):** Free nga marketplace, focus sa user acquisition
2. **Phase 2 (Monetization):** I-launch ang commission ug featured listings human madaghan ang active users
3. **Phase 3 (Expansion):** Premium subscriptions, logistics partnerships, nationwide coverage

## Key Metrics to Track

- GMV (Gross Merchandise Value) — total sales volume
- Take rate — commission % per order
- Active buyers/sellers
- Order frequency ug average order value (AOV)
- Customer acquisition cost (CAC) vs lifetime value (LTV)
