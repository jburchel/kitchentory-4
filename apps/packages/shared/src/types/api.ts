import {
  User,
  Product,
  InventoryItem,
  Recipe,
  ShoppingList,
  MealPlan,
  UnitType,
  LocationType,
  DietaryRestriction
} from './database';

// Common API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

// User operations
export interface UpdateUserRequest {
  name?: string;
  settings?: Record<string, any>;
}

// Product operations
export interface CreateProductRequest {
  barcode?: string;
  name: string;
  brand?: string;
  category_id?: string;
  default_unit?: UnitType;
  default_quantity?: number;
  image_url?: string;
  nutritional_info?: Record<string, any>;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductSearchQuery extends PaginationQuery {
  q?: string;
  category_id?: string;
  barcode?: string;
}

// Inventory operations
export interface CreateInventoryItemRequest {
  product_id: string;
  quantity: number;
  unit: UnitType;
  location: LocationType;
  expiration_date?: string;
  purchase_date?: string;
  purchase_price?: number;
  notes?: string;
}

export interface UpdateInventoryItemRequest extends Partial<CreateInventoryItemRequest> {
  is_consumed?: boolean;
}

export interface InventoryQuery extends PaginationQuery {
  location?: LocationType;
  expiring_soon?: boolean;
  expired?: boolean;
  consumed?: boolean;
}

// Recipe operations
export interface CreateRecipeRequest {
  name: string;
  description?: string;
  instructions: string[];
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  dietary_tags?: DietaryRestriction[];
  image_url?: string;
  source_url?: string;
  is_public?: boolean;
  ingredients: Array<{
    product_id?: string;
    name: string;
    quantity: number;
    unit: UnitType;
    is_optional?: boolean;
    notes?: string;
  }>;
}

export interface UpdateRecipeRequest extends Partial<CreateRecipeRequest> {}

export interface RecipeSearchQuery extends PaginationQuery {
  q?: string;
  cuisine?: string;
  dietary_tags?: DietaryRestriction[];
  difficulty?: 'easy' | 'medium' | 'hard';
  available_ingredients_only?: boolean;
  prep_time_max?: number;
  cook_time_max?: number;
}

// Shopping list operations
export interface CreateShoppingListRequest {
  name: string;
}

export interface UpdateShoppingListRequest {
  name?: string;
  is_active?: boolean;
}

export interface AddToShoppingListRequest {
  product_id?: string;
  name: string;
  quantity: number;
  unit: UnitType;
  category_id?: string;
  notes?: string;
}

export interface UpdateShoppingListItemRequest {
  quantity?: number;
  unit?: UnitType;
  is_checked?: boolean;
  notes?: string;
}

export interface GenerateShoppingListRequest {
  recipe_ids?: string[];
  meal_plan_dates?: string[];
  auto_add_expiring?: boolean;
}

// Meal plan operations
export interface CreateMealPlanRequest {
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_id: string;
  servings?: number;
  notes?: string;
}

export interface UpdateMealPlanRequest extends Partial<CreateMealPlanRequest> {}

export interface MealPlanQuery extends PaginationQuery {
  start_date?: string;
  end_date?: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

// Barcode scanning
export interface BarcodeScanRequest {
  barcode: string;
  location?: string;
}

export interface BarcodeScanResponse {
  product?: Product;
  confidence: number;
  suggestions: Product[];
}

// Receipt scanning
export interface ReceiptScanRequest {
  image_url: string;
  store_id?: string;
}

export interface ReceiptScanResponse {
  scan_id: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: UnitType;
    price: number;
    product_suggestions: Product[];
  }>;
  total_amount?: number;
  tax_amount?: number;
  store_name?: string;
  purchase_date?: string;
}

// File upload
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Sync operations
export interface SyncRequest {
  last_sync_at?: string;
  changes: Array<{
    table: string;
    operation: 'insert' | 'update' | 'delete';
    id: string;
    data?: Record<string, any>;
    timestamp: string;
  }>;
}

export interface SyncResponse {
  changes: Array<{
    table: string;
    operation: 'insert' | 'update' | 'delete';
    id: string;
    data?: Record<string, any>;
    timestamp: string;
  }>;
  last_sync_at: string;
}