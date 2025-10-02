// Core Entity Types (from data-model.md)

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  last_login: Date;
  email_verified: boolean;
  phone?: string;
  avatar_url?: string;
  timezone: string;
  locale: string;
  push_token?: string;
  deleted_at?: Date;
}

export interface Household {
  id: string;
  name: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  invite_code: string;
  settings: {
    currency: string;
    default_store_id?: string;
    auto_delete_expired: boolean;
    expiry_warning_days: number;
  };
}

export interface InventoryItem {
  id: string;
  household_id: string;
  product_id: string;
  added_by: string;
  quantity: number;
  unit: string;
  location: StorageLocation;
  purchase_date?: Date;
  expiration_date?: Date;
  opened_date?: Date;
  price?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  consumed_at?: Date;
  photo_url?: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: ProductCategory;
  subcategory?: string;
  description?: string;
  image_url?: string;
  is_perishable: boolean;
  typical_shelf_life_days?: number;
  storage_instructions?: string;
  unit_type: 'piece' | 'weight' | 'volume' | 'package';
  default_unit: string;
  created_at: Date;
  updated_at: Date;
  verified: boolean;
}

export interface Recipe {
  id: string;
  created_by?: string;
  name: string;
  description?: string;
  image_url?: string;
  source_url?: string;
  source_type: 'user' | 'imported' | 'system';
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  total_time_minutes?: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine_type?: string;
  meal_type: MealType[];
  dietary_tags: DietaryTag[];
  instructions: RecipeStep[];
  tips?: string;
  created_at: Date;
  updated_at: Date;
  rating?: number;
  times_cooked?: number;
  is_public: boolean;
}

export interface ShoppingList {
  id: string;
  household_id: string;
  created_by: string;
  name?: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  store_id?: string;
  estimated_total?: number;
  actual_total?: number;
  is_active: boolean;
}

// Enums
export enum StorageLocation {
  PANTRY = 'pantry',
  FRIDGE = 'fridge',
  FREEZER = 'freezer',
  COUNTER = 'counter',
  CABINET = 'cabinet',
  OTHER = 'other'
}

export enum ProductCategory {
  PRODUCE = 'produce',
  DAIRY = 'dairy',
  MEAT = 'meat',
  SEAFOOD = 'seafood',
  BAKERY = 'bakery',
  FROZEN = 'frozen',
  PANTRY = 'pantry',
  BEVERAGES = 'beverages',
  SNACKS = 'snacks',
  CONDIMENTS = 'condiments',
  HOUSEHOLD = 'household',
  PERSONAL_CARE = 'personal_care',
  OTHER = 'other'
}

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  DESSERT = 'dessert',
  DRINK = 'drink'
}

export enum DietaryTag {
  VEGAN = 'vegan',
  VEGETARIAN = 'vegetarian',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
  KETO = 'keto',
  PALEO = 'paleo',
  LOW_CARB = 'low_carb',
  NUT_FREE = 'nut_free'
}

export interface RecipeStep {
  order: number;
  instruction: string;
  duration_minutes?: number;
  timer_needed: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    username: string;
    subscription_tier: string;
  };
  token: string;
}