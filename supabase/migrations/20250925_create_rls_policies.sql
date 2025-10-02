-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barcode_scans ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Households policies
CREATE POLICY "Users can view households they belong to" ON public.households
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.household_members
            WHERE household_id = households.id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create households" ON public.households
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can update households" ON public.households
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.household_members
            WHERE household_id = households.id
            AND user_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete households" ON public.households
    FOR DELETE USING (created_by = auth.uid());

-- Household members policies
CREATE POLICY "Members can view household members" ON public.household_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.household_members hm
            WHERE hm.household_id = household_members.household_id
            AND hm.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage household members" ON public.household_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.household_members hm
            WHERE hm.household_id = household_members.household_id
            AND hm.user_id = auth.uid()
            AND hm.role = 'admin'
        )
    );

-- Categories policies
CREATE POLICY "Users can view own and household categories" ON public.categories
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.household_members
            WHERE household_id = categories.household_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own categories" ON public.categories
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Household members can manage household categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.household_members
            WHERE household_id = categories.household_id
            AND user_id = auth.uid()
        )
    );

-- Products policies (public read, authenticated write)
CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update products" ON public.products
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Inventory items policies
CREATE POLICY "Users can view own and household inventory" ON public.inventory_items
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.household_members
            WHERE household_id = inventory_items.household_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own inventory" ON public.inventory_items
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Household members can manage household inventory" ON public.inventory_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.household_members
            WHERE household_id = inventory_items.household_id
            AND user_id = auth.uid()
        )
    );

-- Recipes policies
CREATE POLICY "Public recipes are viewable by all" ON public.recipes
    FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can manage own recipes" ON public.recipes
    FOR ALL USING (created_by = auth.uid());

-- Recipe ingredients policies
CREATE POLICY "View ingredients for accessible recipes" ON public.recipe_ingredients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE id = recipe_ingredients.recipe_id
            AND (is_public = true OR created_by = auth.uid())
        )
    );

CREATE POLICY "Manage ingredients for own recipes" ON public.recipe_ingredients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE id = recipe_ingredients.recipe_id
            AND created_by = auth.uid()
        )
    );

-- Shopping lists policies
CREATE POLICY "Users can view own and household shopping lists" ON public.shopping_lists
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.household_members
            WHERE household_id = shopping_lists.household_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own shopping lists" ON public.shopping_lists
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Household members can manage household shopping lists" ON public.shopping_lists
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.household_members
            WHERE household_id = shopping_lists.household_id
            AND user_id = auth.uid()
        )
    );

-- Shopping list items policies
CREATE POLICY "View items for accessible lists" ON public.shopping_list_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.shopping_lists
            WHERE id = shopping_list_items.shopping_list_id
            AND (
                user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.household_members
                    WHERE household_id = shopping_lists.household_id
                    AND user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Manage items for accessible lists" ON public.shopping_list_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.shopping_lists
            WHERE id = shopping_list_items.shopping_list_id
            AND (
                user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.household_members
                    WHERE household_id = shopping_lists.household_id
                    AND user_id = auth.uid()
                )
            )
        )
    );

-- Meal plans policies
CREATE POLICY "Users can view own and household meal plans" ON public.meal_plans
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.household_members
            WHERE household_id = meal_plans.household_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own meal plans" ON public.meal_plans
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Household members can manage household meal plans" ON public.meal_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.household_members
            WHERE household_id = meal_plans.household_id
            AND user_id = auth.uid()
        )
    );

-- Stores policies (public read)
CREATE POLICY "Anyone can view stores" ON public.stores
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create stores" ON public.stores
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Store prices policies (public read)
CREATE POLICY "Anyone can view store prices" ON public.store_prices
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage store prices" ON public.store_prices
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Receipt scans policies
CREATE POLICY "Users can view own receipts" ON public.receipt_scans
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own receipts" ON public.receipt_scans
    FOR ALL USING (user_id = auth.uid());

-- Barcode scans policies
CREATE POLICY "Users can view own scans" ON public.barcode_scans
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own scans" ON public.barcode_scans
    FOR ALL USING (user_id = auth.uid());