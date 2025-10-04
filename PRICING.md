# Kitchentory Subscription Tiers

## Pricing Structure

### 🆓 Free Tier
**Price:** $0/month

**Features:**
- Up to 50 inventory items
- Basic recipe discovery (20 recipes)
- 1 shopping list
- Manual item entry only
- Local device storage
- Basic expiration alerts

**Limitations:**
- No barcode scanning
- No OCR receipt scanning
- No household sharing
- Limited recipe access

---

### 💎 Pro Tier
**Price:** $3.99/month or $39.99/year (save 17%)

**Features:**
- **Unlimited inventory items**
- **Unlimited recipes**
- **Unlimited shopping lists**
- ✅ Barcode scanning
- ✅ Manual item entry
- ✅ Smart expiration notifications
- ✅ Recipe suggestions based on inventory
- ✅ Auto-generated shopping lists
- ✅ Cloud sync across devices
- ✅ Export data (CSV)
- Up to 3 household members

**Ideal for:** Individuals and couples managing their kitchen

---

### 👨‍👩‍👧‍👦 Premium (Family) Tier
**Price:** $9.99/month or $99.99/year (save 17%)

**Features:**
- **Everything in Pro, plus:**
- ✅ **OCR receipt scanning**
- ✅ **AI-powered meal planning**
- ✅ **Nutritional tracking**
- ✅ **Store price comparison**
- ✅ **Unlimited household members**
- ✅ **Multiple households**
- ✅ **Priority customer support**
- ✅ **Advanced analytics & insights**
- ✅ **Recipe collections & meal plans**
- ✅ **Export to meal kit services**

**Ideal for:** Families and power users

---

## Feature Comparison Matrix

| Feature | Free | Pro | Premium |
|---------|------|-----|---------|
| Inventory Items | 50 | Unlimited | Unlimited |
| Recipes | 20 | Unlimited | Unlimited |
| Shopping Lists | 1 | Unlimited | Unlimited |
| Barcode Scanning | ❌ | ✅ | ✅ |
| Receipt OCR | ❌ | ❌ | ✅ |
| Household Members | 1 | 3 | Unlimited |
| Multiple Households | ❌ | ❌ | ✅ |
| Cloud Sync | ❌ | ✅ | ✅ |
| Meal Planning | ❌ | Basic | AI-Powered |
| Nutritional Info | ❌ | ❌ | ✅ |
| Price Comparison | ❌ | ❌ | ✅ |
| Export Data | ❌ | CSV | CSV + API |
| Customer Support | Community | Email | Priority |

---

## Implementation Notes

### Stripe Product IDs (to be created)
- `prod_free` - Free tier (no payment required)
- `prod_pro_monthly` - Pro $3.99/month
- `prod_pro_yearly` - Pro $39.99/year
- `prod_premium_monthly` - Premium $9.99/month
- `prod_premium_yearly` - Premium $99.99/year

### Database Enum
```sql
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'premium');
```

### Feature Flags by Tier
```typescript
const tierLimits = {
  free: {
    maxInventoryItems: 50,
    maxRecipes: 20,
    maxShoppingLists: 1,
    maxHouseholdMembers: 1,
    barcodeScanning: false,
    ocrScanning: false,
    cloudSync: false,
    mealPlanning: false,
  },
  pro: {
    maxInventoryItems: Infinity,
    maxRecipes: Infinity,
    maxShoppingLists: Infinity,
    maxHouseholdMembers: 3,
    barcodeScanning: true,
    ocrScanning: false,
    cloudSync: true,
    mealPlanning: 'basic',
  },
  premium: {
    maxInventoryItems: Infinity,
    maxRecipes: Infinity,
    maxShoppingLists: Infinity,
    maxHouseholdMembers: Infinity,
    barcodeScanning: true,
    ocrScanning: true,
    cloudSync: true,
    mealPlanning: 'ai-powered',
    nutritionalTracking: true,
    priceComparison: true,
    multipleHouseholds: true,
  },
};
```

---

## Revenue Projections

### Conservative (Year 1)
- 1,000 Free users
- 100 Pro users ($3.99/mo) = $399/month = $4,788/year
- 20 Premium users ($9.99/mo) = $199.80/month = $2,397.60/year
- **Total: $7,185.60/year**

### Moderate (Year 1)
- 5,000 Free users
- 500 Pro users = $1,995/month = $23,940/year
- 100 Premium users = $999/month = $11,988/year
- **Total: $35,928/year**

### Optimistic (Year 1)
- 10,000 Free users
- 1,000 Pro users = $3,990/month = $47,880/year
- 250 Premium users = $2,497.50/month = $29,970/year
- **Total: $77,850/year**

---

*Last Updated: October 2025*
