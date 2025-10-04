-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Create subscription tier enum
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'premium');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT false,
    phone TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    locale TEXT DEFAULT 'en',
    push_token TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Households table
CREATE TABLE public.households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    settings JSONB DEFAULT '{
        "currency": "USD",
        "auto_delete_expired": false,
        "expiry_warning_days": 3
    }'
);

-- Household members junction table
CREATE TABLE public.household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    invited_by UUID REFERENCES public.users(id),
    can_edit_inventory BOOLEAN DEFAULT true,
    can_edit_recipes BOOLEAN DEFAULT true,
    can_edit_shopping BOOLEAN DEFAULT true,
    nickname TEXT,
    UNIQUE(household_id, user_id)
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'premium')),
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_end TIMESTAMP WITH TIME ZONE,
    features JSONB DEFAULT '{
        "max_items": 50,
        "max_recipes": 10,
        "receipt_scans": 0,
        "store_integrations": 0,
        "household_members": 1
    }',
    UNIQUE(user_id)
);

-- Products table (master catalog)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'produce', 'dairy', 'meat', 'seafood', 'bakery', 'frozen',
        'pantry', 'beverages', 'snacks', 'condiments', 'household',
        'personal_care', 'other'
    )),
    subcategory TEXT,
    description TEXT,
    image_url TEXT,
    is_perishable BOOLEAN DEFAULT true,
    typical_shelf_life_days INTEGER,
    storage_instructions TEXT,
    unit_type TEXT NOT NULL CHECK (unit_type IN ('piece', 'weight', 'volume', 'package')),
    default_unit TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    verified BOOLEAN DEFAULT false
);

-- Product barcodes table
CREATE TABLE public.product_barcodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    barcode TEXT NOT NULL,
    barcode_type TEXT NOT NULL CHECK (barcode_type IN ('upc_a', 'upc_e', 'ean_13', 'ean_8')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    source TEXT DEFAULT 'manual',
    UNIQUE(barcode)
);

-- Inventory items table
CREATE TABLE public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    added_by UUID NOT NULL REFERENCES public.users(id),
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    location TEXT NOT NULL CHECK (location IN ('pantry', 'fridge', 'freezer', 'counter', 'cabinet', 'other')),
    purchase_date DATE,
    expiration_date DATE,
    opened_date DATE,
    price DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    consumed_at TIMESTAMP WITH TIME ZONE,
    photo_url TEXT
);

-- Recipes table
CREATE TABLE public.recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES public.users(id),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    source_url TEXT,
    source_type TEXT NOT NULL CHECK (source_type IN ('user', 'imported', 'system')),
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    total_time_minutes INTEGER,
    servings INTEGER NOT NULL CHECK (servings > 0),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    cuisine_type TEXT,
    meal_type TEXT[] DEFAULT '{}',
    dietary_tags TEXT[] DEFAULT '{}',
    instructions JSONB DEFAULT '[]',
    tips TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    rating DECIMAL(3,2),
    times_cooked INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false
);

-- Recipe ingredients table
CREATE TABLE public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    name TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit TEXT NOT NULL,
    preparation TEXT,
    optional BOOLEAN DEFAULT false,
    substitutions TEXT[] DEFAULT '{}',
    ingredient_group TEXT,
    order_index INTEGER NOT NULL
);

-- Shopping lists table
CREATE TABLE public.shopping_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id),
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    store_id UUID,
    estimated_total DECIMAL(10,2),
    actual_total DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true
);

-- Shopping list items table
CREATE TABLE public.shopping_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    name TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    category TEXT NOT NULL,
    notes TEXT,
    assigned_to UUID REFERENCES public.users(id),
    price_estimate DECIMAL(10,2),
    store_aisle TEXT,
    checked BOOLEAN DEFAULT false,
    checked_by UUID REFERENCES public.users(id),
    checked_at TIMESTAMP WITH TIME ZONE,
    source TEXT NOT NULL CHECK (source IN ('manual', 'inventory', 'meal_plan', 'auto'))
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_household_expiry ON public.inventory_items(household_id, expiration_date);
CREATE INDEX idx_inventory_location ON public.inventory_items(household_id, location);
CREATE INDEX idx_product_name ON public.products USING GIN(to_tsvector('english', name));
CREATE INDEX idx_product_category ON public.products(category);
CREATE INDEX idx_recipe_dietary ON public.recipes USING GIN(dietary_tags);
CREATE INDEX idx_recipe_meal_type ON public.recipes USING GIN(meal_type);
CREATE INDEX idx_shopping_active ON public.shopping_lists(household_id, is_active);
CREATE INDEX idx_shopping_item_checked ON public.shopping_list_items(shopping_list_id, checked);
CREATE INDEX idx_barcode_lookup ON public.product_barcodes(barcode);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_barcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for households
CREATE POLICY "Household members can view household" ON public.households
FOR SELECT USING (
    id IN (
        SELECT household_id FROM public.household_members
        WHERE user_id = auth.uid()
    )
);

-- RLS Policies for household_members
CREATE POLICY "Users can view household members" ON public.household_members
FOR SELECT USING (
    household_id IN (
        SELECT household_id FROM public.household_members
        WHERE user_id = auth.uid()
    )
);

-- RLS Policies for inventory_items
CREATE POLICY "Household members can view inventory" ON public.inventory_items
FOR SELECT USING (
    household_id IN (
        SELECT household_id FROM public.household_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Household members can insert inventory" ON public.inventory_items
FOR INSERT WITH CHECK (
    household_id IN (
        SELECT household_id FROM public.household_members
        WHERE user_id = auth.uid() AND can_edit_inventory = true
    )
);

CREATE POLICY "Household members can update inventory" ON public.inventory_items
FOR UPDATE USING (
    household_id IN (
        SELECT household_id FROM public.household_members
        WHERE user_id = auth.uid() AND can_edit_inventory = true
    )
);

CREATE POLICY "Household members can delete inventory" ON public.inventory_items
FOR DELETE USING (
    household_id IN (
        SELECT household_id FROM public.household_members
        WHERE user_id = auth.uid() AND can_edit_inventory = true
    )
);

-- RLS Policies for products (public read)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- RLS Policies for recipes
CREATE POLICY "Anyone can view public recipes" ON public.recipes FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own recipes" ON public.recipes FOR SELECT USING (created_by = auth.uid());

-- Functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON public.households
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON public.shopping_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();