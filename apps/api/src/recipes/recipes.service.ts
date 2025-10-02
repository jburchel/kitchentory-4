import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  Recipe,
  RecipeIngredient,
  CreateRecipeRequest,
  UpdateRecipeRequest,
  RecipeSearchQuery,
  PaginatedResponse,
} from '@kitchentory/shared';

@Injectable()
export class RecipesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(userId: string, createRecipeDto: CreateRecipeRequest): Promise<Recipe> {
    const supabase = this.supabaseService.getClient();

    const { ingredients, ...recipeData } = createRecipeDto;

    // Create recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        ...recipeData,
        created_by: userId,
      })
      .select()
      .single();

    if (recipeError) {
      throw new Error(`Failed to create recipe: ${recipeError.message}`);
    }

    // Create ingredients
    if (ingredients && ingredients.length > 0) {
      const ingredientsData = ingredients.map((ing) => ({
        recipe_id: recipe.id,
        ...ing,
      }));

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientsData);

      if (ingredientsError) {
        throw new Error(`Failed to create ingredients: ${ingredientsError.message}`);
      }
    }

    return recipe as Recipe;
  }

  async findAll(userId: string, query: RecipeSearchQuery): Promise<PaginatedResponse<Recipe>> {
    const supabase = this.supabaseService.getClient();
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let queryBuilder = supabase
      .from('recipes')
      .select('*', { count: 'exact' })
      .or(`is_public.eq.true,created_by.eq.${userId}`)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (query.q) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query.q}%,description.ilike.%${query.q}%`,
      );
    }

    if (query.cuisine) {
      queryBuilder = queryBuilder.eq('cuisine', query.cuisine);
    }

    if (query.difficulty) {
      queryBuilder = queryBuilder.eq('difficulty', query.difficulty);
    }

    if (query.prep_time_max) {
      queryBuilder = queryBuilder.lte('prep_time_minutes', query.prep_time_max);
    }

    if (query.cook_time_max) {
      queryBuilder = queryBuilder.lte('cook_time_minutes', query.cook_time_max);
    }

    if (query.dietary_tags && query.dietary_tags.length > 0) {
      queryBuilder = queryBuilder.contains('dietary_tags', query.dietary_tags);
    }

    const { data, error, count } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to fetch recipes: ${error.message}`);
    }

    return {
      items: data as Recipe[],
      total: count || 0,
      page,
      limit,
      hasMore: offset + limit < (count || 0),
    };
  }

  async findOne(userId: string, id: string): Promise<Recipe & { ingredients: RecipeIngredient[] }> {
    const supabase = this.supabaseService.getClient();

    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .or(`is_public.eq.true,created_by.eq.${userId}`)
      .single();

    if (recipeError || !recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    // Get ingredients
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .select('*, product:products(*)')
      .eq('recipe_id', id);

    if (ingredientsError) {
      throw new Error(`Failed to fetch ingredients: ${ingredientsError.message}`);
    }

    return {
      ...(recipe as Recipe),
      ingredients: ingredients as RecipeIngredient[],
    };
  }

  async update(
    userId: string,
    id: string,
    updateRecipeDto: UpdateRecipeRequest,
  ): Promise<Recipe> {
    const supabase = this.supabaseService.getClient();

    const { ingredients, ...recipeData } = updateRecipeDto;

    // Update recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .update(recipeData)
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (recipeError || !recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    // Update ingredients if provided
    if (ingredients) {
      // Delete existing ingredients
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);

      // Insert new ingredients
      if (ingredients.length > 0) {
        const ingredientsData = ingredients.map((ing) => ({
          recipe_id: id,
          ...ing,
        }));

        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientsData);

        if (ingredientsError) {
          throw new Error(`Failed to update ingredients: ${ingredientsError.message}`);
        }
      }
    }

    return recipe as Recipe;
  }

  async remove(userId: string, id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('created_by', userId);

    if (error) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }
  }

  async findAvailable(userId: string, query: RecipeSearchQuery): Promise<Recipe[]> {
    const supabase = this.supabaseService.getClient();

    // Get user's inventory
    const { data: inventory } = await supabase
      .from('inventory_items')
      .select('product_id, quantity')
      .eq('user_id', userId)
      .eq('is_consumed', false);

    const availableProductIds = new Set(inventory?.map((item) => item.product_id) || []);

    // Get all recipes
    const { data: recipes } = await supabase
      .from('recipes')
      .select('*, ingredients:recipe_ingredients(product_id, is_optional)')
      .or(`is_public.eq.true,created_by.eq.${userId}`);

    // Filter recipes where user has all required ingredients
    const availableRecipes = recipes?.filter((recipe: any) => {
      const requiredIngredients = recipe.ingredients.filter((ing: any) => !ing.is_optional);
      return requiredIngredients.every((ing: any) =>
        ing.product_id && availableProductIds.has(ing.product_id)
      );
    }) || [];

    return availableRecipes as Recipe[];
  }
}