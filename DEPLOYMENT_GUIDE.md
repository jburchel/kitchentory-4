# 🚀 Kitchentory Production Deployment Guide (2025)

**Your First Deployment - Complete Step-by-Step Guide**

This guide will walk you through deploying Kitchentory to production with:
- Free tier options where possible
- Latest 2025 best practices
- Monetization ready (Free, Pro $3.99, Premium $9.99)

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] GitHub account (free)
- [ ] Credit/debit card (for verification, many services have free tiers)
- [ ] Apple Developer account ($99/year) - for iOS distribution
- [ ] Google Play Console account ($25 one-time) - for Android distribution
- [ ] 2-3 hours of time

---

## Part 1: Database Setup (Supabase) - 15 minutes

### Step 1.1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
   - Click "Start your project"
   - Sign in with GitHub

2. **Create New Organization**
   - Name: "Kitchentory" (or your preferred name)
   - Plan: Free tier (includes 500MB database, 2GB bandwidth)

3. **Create New Project**
   - Name: `kitchentory-prod`
   - Database Password: Generate a strong password (SAVE THIS!)
   - Region: Choose closest to your target users
   - Plan: Free tier
   - Click "Create new project"
   - ⏱️ Wait 2-3 minutes for provisioning

### Step 1.2: Save Your Credentials

You'll see these on the project settings page:

```bash
# Project Settings > API
Project URL: https://xxxxx.supabase.co
anon (public) key: eyJhbGc...
service_role (secret) key: eyJhbGc...

# Project Settings > Database
Connection string: postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**⚠️ SAVE THESE SECURELY** - You'll need them in the next steps!

### Step 1.3: Run Database Migrations

1. **Install Supabase CLI** (if not already installed):
   ```bash
   # Mac/Linux
   brew install supabase/tap/supabase

   # Or via npm
   npm install -g supabase
   ```

2. **Link to your project**:
   ```bash
   cd /Users/macbookair/dev/kitchentory-4

   # Login to Supabase
   supabase login

   # Link to your project
   supabase link --project-ref xxxxx  # Use your project ref from URL
   ```

3. **Push migrations to production**:
   ```bash
   # This will create all tables, RLS policies, etc.
   supabase db push

   # Verify it worked
   supabase db diff
   ```

4. **Verify in Supabase Dashboard**:
   - Go to Table Editor in Supabase dashboard
   - You should see: users, products, inventory_items, recipes, shopping_lists, etc.

---

## Part 2: API Deployment (Render.com) - 20 minutes

**Why Render?** Free tier available, easy deploys, great DX for Node.js apps, auto-deploy from GitHub.

### Step 2.1: Prepare API for Deployment

1. **Update environment variables**:
   ```bash
   cd apps/api
   ```

2. **Create production config** (we'll add these to Render):
   ```env
   # You'll add these in Render dashboard
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_KEY=eyJhbGc...
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   ```

### Step 2.2: Deploy to Render

1. **Go to [render.com](https://render.com)**
   - Click "Get Started" or "Sign In"
   - Sign in with GitHub

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Click "Connect a repository"
   - Find and select your `kitchentory-4` repository
   - Click "Connect"

3. **Configure the deployment**:
   ```
   Name: kitchentory-api
   Region: Oregon (US West) or closest to you
   Branch: main (or your default branch)
   Root Directory: apps/api
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   Instance Type: Free
   ```
   - Click "Advanced" to set Root Directory

4. **Add Environment Variables**:
   - Scroll down to "Environment Variables"
   - Click "Add Environment Variable" for each:
     ```
     NODE_ENV=production
     PORT=10000
     SUPABASE_URL=https://xxxxx.supabase.co
     SUPABASE_ANON_KEY=eyJhbGc... (from Part 1)
     SUPABASE_SERVICE_KEY=eyJhbGc... (from Part 1)
     JWT_SECRET=generate-a-random-32-char-string
     ```

   > **Generate JWT_SECRET**: Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

5. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy (takes 2-3 minutes)
   - You'll get a URL like: `https://kitchentory-api.onrender.com`
   - **SAVE THIS URL** - your mobile app needs it!

6. **Verify Deployment**:
   ```bash
   # Test the health endpoint
   curl https://kitchentory-api.onrender.com
   # Should return: "Hello World!"

   # Check all endpoints are live
   curl https://kitchentory-api.onrender.com/products
   # Should return: 401 (auth required) - this is good!
   ```

**Note**: Free tier spins down after 15 min of inactivity. First request may take 30s. Upgrade to $7/mo for always-on.

### Alternative: Railway.app

<details>
<summary>Click to expand Railway instructions</summary>

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project" → "Deploy from GitHub repo"
3. Select repository, configure:
   - Root Directory: `apps/api`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
4. Add environment variables (same as above but PORT=3001)
5. Generate domain in Settings
6. Railway includes $5/month free credit

</details>

---

## Part 3: Payment Setup (Stripe) - 30 minutes

### Step 3.1: Create Stripe Account

1. **Go to [stripe.com](https://stripe.com)**
   - Click "Start now"
   - Sign up (business details can be added later)
   - Verify email

2. **Get API Keys**:
   - Dashboard → Developers → API keys
   - **Test keys** (for testing):
     - Publishable key: `pk_test_...`
     - Secret key: `sk_test_...`
   - **Live keys** (keep secret!):
     - Publishable key: `pk_live_...`
     - Secret key: `sk_live_...`

### Step 3.2: Create Products in Stripe

1. **Go to Products** in Stripe Dashboard

2. **Create Pro Monthly**:
   - Name: "Kitchentory Pro - Monthly"
   - Description: "Unlimited inventory, recipes, and cloud sync"
   - Pricing: $3.99 USD / month
   - Billing period: Monthly
   - Click "Save product"
   - **Copy the Price ID**: `price_xxxxx`

3. **Create Pro Yearly**:
   - Name: "Kitchentory Pro - Yearly"
   - Pricing: $39.99 USD / year
   - Click "Save product"
   - **Copy the Price ID**: `price_xxxxx`

4. **Create Premium Monthly**:
   - Name: "Kitchentory Premium - Monthly"
   - Description: "All features including OCR and AI meal planning"
   - Pricing: $9.99 USD / month
   - Click "Save product"
   - **Copy the Price ID**: `price_xxxxx`

5. **Create Premium Yearly**:
   - Name: "Kitchentory Premium - Yearly"
   - Pricing: $99.99 USD / year
   - Click "Save product"
   - **Copy the Price ID**: `price_xxxxx`

### Step 3.3: Configure Webhooks

1. **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://kitchentory-api.onrender.com/webhooks/stripe`
3. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Add endpoint
5. **Copy Webhook Secret**: `whsec_...` (you'll need this)

### Step 3.4: Update API with Stripe Keys

Add to Render environment variables (Settings → Environment):
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Product Price IDs
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...
```

---

## Part 4: Mobile App Configuration - 15 minutes

### Step 4.1: Update Mobile App Environment

1. **Edit `apps/mobile/.env.production`**:
   ```bash
   cd /Users/macbookair/dev/kitchentory-4/apps/mobile
   ```

2. **Create production environment file**:
   ```env
   # API Configuration
   API_BASE_URL=https://kitchentory-api.onrender.com

   # Supabase Configuration
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...

   # Stripe Configuration
   STRIPE_PUBLISHABLE_KEY=pk_live_...

   # Environment
   NODE_ENV=production
   ```

### Step 4.2: Update App Configuration

1. **Edit `apps/mobile/app.json`**:
   ```json
   {
     "expo": {
       "name": "Kitchentory",
       "slug": "kitchentory",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#ffffff"
       },
       "ios": {
         "bundleIdentifier": "com.yourdomain.kitchentory",
         "buildNumber": "1",
         "supportsTablet": true
       },
       "android": {
         "package": "com.yourdomain.kitchentory",
         "versionCode": 1,
         "adaptiveIcon": {
           "foregroundImage": "./assets/adaptive-icon.png",
           "backgroundColor": "#ffffff"
         }
       }
     }
   }
   ```

---

## Part 5: iOS Deployment (Apple TestFlight) - 45 minutes

### Step 5.1: Prerequisites

1. **Apple Developer Account**:
   - Go to [developer.apple.com](https://developer.apple.com)
   - Enroll ($99/year)
   - Wait for approval (1-2 days)

2. **Install Xcode** (Mac only):
   - Download from Mac App Store
   - Open once to install command line tools

### Step 5.2: Configure App in App Store Connect

1. **Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)**

2. **Create App**:
   - Click "My Apps" → "+" → "New App"
   - Platform: iOS
   - Name: Kitchentory
   - Primary Language: English
   - Bundle ID: Create new → `com.yourdomain.kitchentory`
   - SKU: KITCHENTORY001
   - User Access: Full Access

3. **App Information**:
   - Category: Food & Drink (Primary), Productivity (Secondary)
   - Age Rating: 4+

4. **In-App Purchases** (for subscriptions):
   - Go to Features → In-App Purchases
   - Click "+" to add subscription group
   - Group Name: "Kitchentory Premium Features"
   - Create subscriptions for Pro and Premium (monthly/yearly)

### Step 5.3: Build and Upload

```bash
cd apps/mobile

# Install dependencies
npm install

# Build for iOS
npx expo prebuild --platform ios

# Open in Xcode
open ios/Kitchentory.xcworkspace

# In Xcode:
# 1. Select "Any iOS Device" as target
# 2. Product → Archive
# 3. Distribute App → App Store Connect
# 4. Upload
```

### Step 5.4: TestFlight Setup

1. In App Store Connect → TestFlight
2. Add internal testers (up to 100 free)
3. Share TestFlight link: `https://testflight.apple.com/join/xxxxx`
4. Testers install TestFlight app → join your beta

---

## Part 6: Android Deployment (Google Play Internal Testing) - 30 minutes

### Step 6.1: Google Play Console Setup

1. **Go to [play.google.com/console](https://play.google.com/console)**
   - Pay $25 one-time registration fee

2. **Create App**:
   - Click "Create app"
   - Name: Kitchentory
   - Language: English (United States)
   - App/Game: App
   - Free/Paid: Free (with in-app purchases)
   - Accept declarations
   - Create app

### Step 6.2: Build Android APK/AAB

```bash
cd apps/mobile

# Build for Android
npx expo prebuild --platform android

# Create release build
cd android
./gradlew bundleRelease

# Output will be at:
# android/app/build/outputs/bundle/release/app-release.aab
```

### Step 6.3: Upload to Play Console

1. **Production → Internal testing**
2. Create new release
3. Upload AAB file
4. Add release notes:
   ```
   Initial beta release
   - Inventory management
   - Recipe discovery
   - Shopping lists
   - Cloud sync (Pro/Premium)
   ```
5. Save → Review release → Start rollout

6. **Create internal testing track**:
   - Add email addresses of testers
   - Share opt-in URL with testers

---

## Part 7: Configure Subscription Features - 20 minutes

### Step 7.1: Create Subscription Service

Create `apps/api/src/subscriptions/subscriptions.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-10-28.acacia',
    });
  }

  async createCheckoutSession(userId: string, priceId: string) {
    const session = await this.stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.APP_URL}/subscription/success`,
      cancel_url: `${process.env.APP_URL}/subscription/cancel`,
      metadata: { userId },
    });

    return { sessionId: session.id, url: session.url };
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Update user tier in database
        break;
      case 'customer.subscription.deleted':
        // Downgrade to free tier
        break;
    }
  }

  getTierLimits(tier: string) {
    const limits = {
      free: { maxItems: 50, maxRecipes: 20, maxLists: 1 },
      pro: { maxItems: Infinity, maxRecipes: Infinity, maxLists: Infinity },
      premium: { maxItems: Infinity, maxRecipes: Infinity, maxLists: Infinity },
    };
    return limits[tier] || limits.free;
  }
}
```

---

## Part 8: Testing & Launch Checklist

### Pre-Launch Testing

- [ ] Test user registration/login
- [ ] Test inventory CRUD operations
- [ ] Test recipe discovery
- [ ] Test shopping list creation
- [ ] Test subscription upgrade flow (use Stripe test cards)
- [ ] Test on real iOS device via TestFlight
- [ ] Test on real Android device via Internal Testing
- [ ] Verify webhook deliveries in Stripe dashboard
- [ ] Test downgrade/cancellation flow

### Launch Day Checklist

- [ ] Set Render to always-on if needed ($7/mo) or accept 30s cold starts
- [ ] Switch Stripe from test mode to live mode
- [ ] Update mobile apps to use production API URL
- [ ] Submit iOS app for review (takes 1-2 days)
- [ ] Move Android to open/closed beta testing
- [ ] Set up error monitoring (Sentry.io - free tier)
- [ ] Set up analytics (PostHog, Mixpanel - free tiers)
- [ ] Create privacy policy & terms of service
- [ ] Add support email: support@kitchentory.com

---

## 💰 Expected Costs (Monthly)

### Starting with Free Tiers (No App Stores)

| Service | Plan | Cost |
|---------|------|------|
| Supabase | Free tier | $0 (up to 500MB DB) |
| Render | Free tier | $0 (spins down after 15min) |
| Stripe | Test mode | $0 (until you go live) |
| **Total** | | **$0/month** |

**Perfect for testing!** Deploy and test with Expo Go before investing in app stores.

### Production Costs (with App Stores)

| Service | Plan | Cost |
|---------|------|------|
| Supabase | Free tier | $0 (up to 500MB DB) |
| Render | Starter (always-on) | $7/month |
| Stripe | Pay as you go | 2.9% + $0.30 per transaction |
| Apple Developer | Annual | $99/year ($8.25/month) |
| Google Play | One-time | $25 (one-time) |
| **Total Month 1** | | **~$40** (includes Google one-time) |
| **Total Ongoing** | | **~$15/month** |

**Break-even**: With your pricing ($3.99 Pro, $9.99 Premium), you need just 2-3 paying customers to cover costs!

---

## 🆘 Common Issues & Solutions

### Issue: Database migrations fail
**Solution**: Make sure you're linked to the right project:
```bash
supabase projects list
supabase link --project-ref <correct-ref>
```

### Issue: Render build fails
**Solution**: Check build logs in Render dashboard, ensure package.json scripts are correct:
```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main"
  }
}
```

### Issue: Render says "Deploy failed: No such file or directory"
**Solution**: Make sure Root Directory is set to `apps/api` in Render settings.

### Issue: Mobile app can't connect to API
**Solution**:
1. Verify API_BASE_URL in .env
2. Check Render logs (Logs tab in dashboard)
3. Test API endpoint directly: `curl https://kitchentory-api.onrender.com`
4. If using free tier, wait 30s for cold start

### Issue: Stripe webhooks not receiving events
**Solution**:
1. Verify webhook URL is correct in Stripe dashboard
2. Check Render logs for incoming requests
3. Test with Stripe CLI: `stripe listen --forward-to https://kitchentory-api.onrender.com/webhooks/stripe`

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Render Docs**: https://docs.render.com
- **Stripe Docs**: https://stripe.com/docs
- **Expo Docs**: https://docs.expo.dev
- **React Native**: https://reactnative.dev/docs
- **NestJS**: https://docs.nestjs.com

---

## 🎉 Next Steps After Deployment

1. **Marketing**:
   - Create landing page
   - Product Hunt launch
   - Social media presence

2. **User Feedback**:
   - Set up feedback form
   - Monitor app reviews
   - Track analytics

3. **Iterate**:
   - Add requested features
   - Fix bugs quickly
   - Optimize performance

---

**Ready to deploy? Start with Part 1 and work through each section!**

*Last updated: October 2025*
