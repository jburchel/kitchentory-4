# Kitchentory Quick Start Guide

**Version**: 1.0.0
**Last Updated**: 2025-09-18

## Prerequisites

- Node.js 20+ and npm 10+
- iOS 15+ or Android 11+ device (or simulators)
- PostgreSQL 14+ (or Supabase account)
- Redis 7+ (optional for caching)

## Quick Setup (< 5 minutes)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/kitchentory.git
cd kitchentory

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 2. Database Setup

```bash
# Using Supabase (Recommended)
# 1. Create account at https://supabase.com
# 2. Copy connection string to .env
# 3. Run migrations
npm run db:migrate

# Using Local PostgreSQL
createdb kitchentory
npm run db:migrate
```

### 3. Start Development

```bash
# Terminal 1: Start API server
npm run api:dev

# Terminal 2: Start React Native Metro
npm run mobile:start

# Terminal 3: Run iOS or Android
npm run ios
# OR
npm run android
```

## First User Journey Test

### Test 1: Basic Inventory Management (2 minutes)

1. **Register Account**
   ```
   - Open app
   - Tap "Get Started"
   - Enter email, password, username
   - Verify email sent
   ```

2. **Add First Item via Barcode**
   ```
   - Tap + button
   - Select "Scan Barcode"
   - Scan any food item barcode
   - Verify product details auto-populate
   - Set quantity and location
   - Tap "Add to Inventory"
   ```

3. **Verify Inventory**
   ```
   - Go to Inventory tab
   - Verify item appears with correct details
   - Tap item to view details
   - Edit quantity
   - Verify change persists
   ```

### Test 2: Recipe Discovery (3 minutes)

1. **Find Recipe with Available Ingredients**
   ```
   - Add 5+ items to inventory (milk, eggs, flour, etc.)
   - Go to Recipes tab
   - Toggle "Available Ingredients Only"
   - Verify recipes shown use inventory items
   ```

2. **Save and Plan Recipe**
   ```
   - Select any recipe
   - Tap "Save Recipe"
   - Tap "Add to Meal Plan"
   - Select date
   - Verify appears in calendar
   ```

3. **Cook Recipe**
   ```
   - Go to Meal Plan
   - Select today's meal
   - Tap "Start Cooking"
   - Follow steps with timers
   - Mark as completed
   - Verify ingredients deducted from inventory
   ```

### Test 3: Smart Shopping List (2 minutes)

1. **Generate Shopping List**
   ```
   - Go to Shopping tab
   - Tap "Generate List"
   - Verify depleted items appear
   - Verify meal plan ingredients added
   ```

2. **Shop with List**
   ```
   - View list organized by aisle
   - Check off items as you shop
   - Verify real-time sync if multiple devices
   ```

3. **Complete Shopping**
   ```
   - Mark list as completed
   - Option to add items to inventory
   - Verify new items in inventory
   ```

## API Testing with cURL

### Authentication
```bash
# Register
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","username":"testuser"}'

# Login (save token)
TOKEN=$(curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  | jq -r '.token')
```

### Inventory Operations
```bash
# Get inventory
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/v1/inventory

# Add item
curl -X POST http://localhost:3000/v1/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":"123","quantity":2,"unit":"pieces","location":"pantry"}'

# Scan barcode
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/v1/products/barcode/041220905836
```

### Recipe Operations
```bash
# Get available recipes
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/v1/recipes?available_only=true"

# Import recipe from URL
curl -X POST http://localhost:3000/v1/recipes/import \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.allrecipes.com/recipe/24059/creamy-rice-pudding/"}'
```

## Running Tests

```bash
# Unit tests
npm test

# Integration tests (requires DB)
npm run test:integration

# E2E tests (requires running app)
npm run test:e2e

# Contract tests
npm run test:contracts
```

## Verify Features by Subscription Tier

### Free Tier Test
```bash
# Set user to free tier
npm run script:set-tier free test@example.com

# Verify limitations:
# - Max 50 items in inventory
# - Max 10 saved recipes
# - No receipt scanning
# - No store integrations
```

### Pro Tier Test
```bash
# Set user to pro tier
npm run script:set-tier pro test@example.com

# Test features:
# - Unlimited inventory
# - Receipt scanning (10/month)
# - 2 store integrations
# - Family sharing (2 members)
```

### Premium Tier Test
```bash
# Set user to premium tier
npm run script:set-tier premium test@example.com

# Test features:
# - All pro features
# - Unlimited receipt scanning
# - All store integrations
# - 5 family members
# - Advanced analytics
```

## Performance Benchmarks

Run performance tests to verify requirements:

```bash
# Barcode scanning (<2s requirement)
npm run perf:barcode

# Receipt OCR (<5s requirement)
npm run perf:ocr

# API response time (<200ms requirement)
npm run perf:api

# UI frame rate (60fps requirement)
npm run perf:ui
```

## Debugging Common Issues

### Issue: Barcode not scanning
```bash
# Check camera permissions
npm run check:permissions

# Test with known barcode
npm run test:barcode 041220905836
```

### Issue: Receipt OCR failing
```bash
# Check Tesseract installation
npm run check:ocr

# Test with sample receipt
npm run test:receipt samples/walmart-receipt.jpg
```

### Issue: Offline sync not working
```bash
# Check sync status
npm run debug:sync

# Force sync
npm run force:sync
```

## Production Deployment

### Mobile App Release
```bash
# Build iOS
npm run build:ios:release

# Build Android
npm run build:android:release

# Submit to stores
npm run submit:ios
npm run submit:android
```

### API Deployment
```bash
# Build and test
npm run build:api
npm run test:prod

# Deploy to production
npm run deploy:api
```

## Monitoring

### Health Checks
- API Health: https://api.kitchentory.com/health
- Database: https://api.kitchentory.com/health/db
- Redis: https://api.kitchentory.com/health/redis

### Metrics Dashboard
- Login: https://metrics.kitchentory.com
- Key metrics: Response time, error rate, active users

## Support

- Documentation: https://docs.kitchentory.com
- Issues: https://github.com/yourusername/kitchentory/issues
- Discord: https://discord.gg/kitchentory

---

**Congratulations!** You've successfully set up and tested Kitchentory. The app should now be tracking your inventory, suggesting recipes, and generating shopping lists.