export type SubscriptionTier = 'free' | 'premium' | 'family';

export type UnitType = 'item' | 'kg' | 'g' | 'l' | 'ml' | 'oz' | 'lb' | 'cup' | 'tbsp' | 'tsp';

export type LocationType = 'fridge' | 'freezer' | 'pantry' | 'spice_rack' | 'other';

export type DietaryRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'kosher'
  | 'halal'
  | 'low_carb'
  | 'keto'
  | 'paleo';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string;
  settings: Record<string, any>;
  last_sync_at?: string;
}

export interface Household {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  settings: Record<string, any>;
}

export interface HouseholdMember {
  household_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  user_id?: string;
  household_id?: string;
  created_at: string;
}

export interface Product {
  id: string;
  barcode?: string;
  name: string;
  brand?: string;
  category_id?: string;
  default_unit: UnitType;
  default_quantity: number;
  image_url?: string;
  nutritional_info?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  user_id?: string;
  household_id?: string;
  quantity: number;
  unit: UnitType;
  location: LocationType;
  expiration_date?: string;
  purchase_date?: string;
  purchase_price?: number;
  notes?: string;
  is_consumed: boolean;
  consumed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  instructions: string[];
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  dietary_tags: DietaryRestriction[];
  image_url?: string;
  source_url?: string;
  created_by?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  product_id?: string;
  name: string;
  quantity: number;
  unit: UnitType;
  is_optional: boolean;
  notes?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  user_id?: string;
  household_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ShoppingListItem {
  id: string;
  shopping_list_id: string;
  product_id?: string;
  name: string;
  quantity: number;
  unit: UnitType;
  category_id?: string;
  is_checked: boolean;
  checked_at?: string;
  notes?: string;
  created_at: string;
}

export interface MealPlan {
  id: string;
  user_id?: string;
  household_id?: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_id: string;
  servings: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  name: string;
  chain_name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  hours?: Record<string, any>;
  created_at: string;
}

export interface StorePrice {
  id: string;
  store_id: string;
  product_id: string;
  price: number;
  unit: UnitType;
  is_on_sale: boolean;
  sale_price?: number;
  valid_from: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export interface ReceiptScan {
  id: string;
  user_id: string;
  store_id?: string;
  image_url: string;
  ocr_text?: string;
  parsed_data?: Record<string, any>;
  total_amount?: number;
  tax_amount?: number;
  purchase_date?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface BarcodeScan {
  id: string;
  user_id: string;
  barcode: string;
  product_id?: string;
  scan_location?: string;
  created_at: string;
}