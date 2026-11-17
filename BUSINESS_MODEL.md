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

## Pricing Tiers

### Seller Tiers

| Tier | Monthly Fee | Features |
|------|-------------|----------|
| **Free** | ₱0 | - Max 10 product listings<br>- Basic analytics<br>- Standard support |
| **Growth** | ₱299 | - Unlimited listings<br>- Featured placement (5 products/month)<br>- Detailed analytics<br>- Priority support<br>- Verified badge |
| **Premium** | ₱499 | - All Growth features<br>- Unlimited featured placements<br>- Bulk upload tools<br>- Custom branding<br>- Dedicated account manager |

### Featured Listing Rates

| Placement | Duration | Price |
|-----------|----------|-------|
| Homepage banner | 7 days | ₱199 |
| Category top | 7 days | ₱99 |
| Search boost | 7 days | ₱49 |

## Marketing Strategy

### Online Channels
- **Social Media:** Facebook, Instagram, TikTok — agriculture groups, food bloggers
- **Facebook Groups:** Pag-apil sa farmer groups, organic food communities
- **Influencer Marketing:** Partner sa mga food vloggers ug agriculture influencers
- **SEO:** "fresh produce near me", "farmers market online", "vegetables delivery"

### Offline Channels
- **Farmer Cooperatives:** Partnership sa local farmer associations
- **Markets:** I-distribute ang flyers sa public markets
- **Events:** Agriculture fairs, food festivals, barangay gatherings

### Referral Program
- **Buyer:** Invite a friend → get ₱50 discount on next order
- **Seller:** Invite a seller → get 1 month free Growth tier

## Operational Plan

### Phase 1: MVP (Months 1-3)
- Launch basic marketplace (buy/sell)
- Onboard 50+ sellers
- 500+ active buyers
- Focus sa Cebu/Mindanao area

### Phase 2: Expansion (Months 4-6)
- Launch commission model (5% per order)
- Add featured listings
- Expand to Visayas
- 1,000+ sellers, 5,000+ buyers

### Phase 3: Scale (Months 7-12)
- Premium subscriptions
- Delivery partnerships
- Nationwide coverage
- 5,000+ sellers, 25,000+ buyers

## Financial Projections (Estimates)

### Year 1 Revenue

| Source | Scenario | Estimate |
|--------|----------|----------|
| Commission (5% of GMV) | GMV ₱5M | ₱250,000 |
| Featured Listings | 50/month avg | ₱60,000 |
| Premium Subscriptions | 200 subs @ ₱499 | ₱1,197,600 |
| **Total** | | **₱1,507,600** |

### Year 1 Costs

| Cost Item | Monthly | Annual |
|-----------|---------|--------|
| Supabase Pro | $25/mo | ₱16,500 |
| EAS Build (Expo) | ₱500/mo | ₱6,000 |
| Marketing | ₱15,000/mo | ₱180,000 |
| Support Team (2) | ₱25,000/mo | ₱600,000 |
| Payment Gateway Fees | 2% of GMV | ₱100,000 |
| **Total** | | **₱902,500** |

### Net Profit (Year 1)
- **Revenue:** ₱1,507,600
- **Costs:** ₱902,500
- **Net Profit:** ₱605,100

## Risk Management

### Key Risks
1. **Low Seller Adoption** — Solution: Free tier + onboarding incentives
2. **Payment Disputes** — Solution: Clear refund policy, dispute resolution team
3. **Quality Control** — Solution: Seller verification, buyer reviews
4. **Competition** — Solution: Local focus, language support, unique features

### Mitigation Strategies
- **Seller verification:** Require ID/business permit for Growth+ tiers
- **Buyer protection:** Escrow for high-value orders (₱5,000+)
- **Insurance:** Product insurance for perishable goods
- **Legal:** Terms of service, seller agreements

## Technology Stack Costs

| Service | Tier | Cost/Month |
|---------|------|------------|
| Supabase (Database + Auth) | Pro | $25 (₱1,375) |
| Expo EAS Build | Free → Build Standby | ₱0 → ₱500 |
| GitHub Pages | Free | ₱0 |
| PayMongo (Payment Gateway) | 3.15% per transaction | Variable |
| Cloudflare (CDN) | Free | ₱0 |

## Future Features

### Phase 4 (Year 2)
- **AI Recommendations:** Product suggestions based on purchase history
- **Group Buying:** Bulk orders para sa discounts
- **Auctions:** Real-time bidding para sa rare items
- **Delivery Tracking:** Real-time GPS tracking

### Phase 5 (Year 3)
- **Supply Chain Integration:** Direct farm-to-restaurant
- **Crop Planning:** AI-assisted planting schedules for farmers
- **International Shipping:** Export of Filipino products
- **White-label Solution:** Offer AgriHub as SaaS to other regions

## Success Criteria

| Metric | Target (Year 1) | Target (Year 3) |
|--------|----------------|-----------------|
| Active Sellers | 1,000 | 10,000 |
| Active Buyers | 25,000 | 500,000 |
| GMV | ₱5M | ₱100M |
| Net Profit | ₱600K | ₱15M |
| Seller Retention | 70% | 85% |
| Buyer Retention | 50% | 75% |
