export const UNIT_TYPES = [
  'item',
  'kg',
  'g',
  'l',
  'ml',
  'oz',
  'lb',
  'cup',
  'tbsp',
  'tsp'
] as const;

export const LOCATION_TYPES = [
  'fridge',
  'freezer',
  'pantry',
  'spice_rack',
  'other'
] as const;

export const DIETARY_RESTRICTIONS = [
  'vegetarian',
  'vegan',
  'gluten_free',
  'dairy_free',
  'nut_free',
  'kosher',
  'halal',
  'low_carb',
  'keto',
  'paleo'
] as const;

export const SUBSCRIPTION_TIERS = ['free', 'premium', 'family'] as const;

export const RECIPE_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export const PROCESSING_STATUSES = ['pending', 'processing', 'completed', 'failed'] as const;

export const HOUSEHOLD_ROLES = ['admin', 'member'] as const;

// Subscription limits
export const SUBSCRIPTION_LIMITS = {
  free: {
    households: 1,
    inventory_items: 100,
    recipes: 50,
    shopping_lists: 3,
    barcode_scans_per_month: 50,
    receipt_scans_per_month: 10
  },
  premium: {
    households: 3,
    inventory_items: 1000,
    recipes: 500,
    shopping_lists: 20,
    barcode_scans_per_month: 500,
    receipt_scans_per_month: 100
  },
  family: {
    households: 10,
    inventory_items: -1, // unlimited
    recipes: -1, // unlimited
    shopping_lists: -1, // unlimited
    barcode_scans_per_month: -1, // unlimited
    receipt_scans_per_month: -1 // unlimited
  }
} as const;

// API configuration
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    profile: '/auth/profile'
  },
  users: {
    base: '/users',
    profile: '/users/profile'
  },
  households: {
    base: '/households',
    members: (id: string) => `/households/${id}/members`,
    invite: (id: string) => `/households/${id}/invite`
  },
  products: {
    base: '/products',
    search: '/products/search',
    barcode: (barcode: string) => `/products/barcode/${barcode}`
  },
  inventory: {
    base: '/inventory',
    expiring: '/inventory/expiring',
    expired: '/inventory/expired'
  },
  recipes: {
    base: '/recipes',
    search: '/recipes/search',
    available: '/recipes/available',
    ingredients: (id: string) => `/recipes/${id}/ingredients`
  },
  shopping: {
    lists: '/shopping/lists',
    generate: '/shopping/generate'
  },
  meals: {
    plans: '/meals/plans',
    calendar: '/meals/calendar'
  },
  scanning: {
    barcode: '/scanning/barcode',
    receipt: '/scanning/receipt'
  },
  sync: {
    base: '/sync'
  },
  uploads: {
    base: '/uploads'
  }
} as const;

// Error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SUBSCRIPTION_LIMIT_EXCEEDED: 'SUBSCRIPTION_LIMIT_EXCEEDED',
  BARCODE_NOT_FOUND: 'BARCODE_NOT_FOUND',
  RECEIPT_PROCESSING_FAILED: 'RECEIPT_PROCESSING_FAILED',
  SYNC_CONFLICT: 'SYNC_CONFLICT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

// Unit conversions (to grams/ml where applicable)
export const UNIT_CONVERSIONS = {
  // Weight conversions to grams
  kg: 1000,
  g: 1,
  oz: 28.35,
  lb: 453.59,

  // Volume conversions to ml
  l: 1000,
  ml: 1,
  cup: 236.59,
  tbsp: 14.79,
  tsp: 4.93
} as const;

// Default settings
export const DEFAULT_USER_SETTINGS = {
  notifications: {
    expiration_alerts: true,
    shopping_reminders: true,
    meal_planning: true
  },
  preferences: {
    default_location: 'pantry' as const,
    default_unit: 'item' as const,
    currency: 'USD',
    date_format: 'MM/DD/YYYY',
    theme: 'system'
  },
  privacy: {
    share_recipes: false,
    allow_household_invites: true
  }
} as const;