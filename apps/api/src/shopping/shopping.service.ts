import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ShoppingList,
  ShoppingListItem,
  CreateShoppingListRequest,
  UpdateShoppingListRequest,
  AddToShoppingListRequest,
  UpdateShoppingListItemRequest,
  GenerateShoppingListRequest,
  PaginatedResponse,
} from '@kitchentory/shared';

@Injectable()
export class ShoppingService {
  constructor(private supabaseService: SupabaseService) {}

  async createList(
    userId: string,
    createListDto: CreateShoppingListRequest,
  ): Promise<ShoppingList> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({
        ...createListDto,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create shopping list: ${error.message}`);
    }

    return data as ShoppingList;
  }

  async findAllLists(userId: string): Promise<ShoppingList[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch shopping lists: ${error.message}`);
    }

    return data as ShoppingList[];
  }

  async findOneList(userId: string, id: string): Promise<ShoppingList & { items: ShoppingListItem[] }> {
    const supabase = this.supabaseService.getClient();

    const { data: list, error: listError } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (listError || !list) {
      throw new NotFoundException(`Shopping list with ID ${id} not found`);
    }

    const { data: items, error: itemsError } = await supabase
      .from('shopping_list_items')
      .select('*, product:products(*), category:categories(*)')
      .eq('shopping_list_id', id)
      .order('created_at', { ascending: true });

    if (itemsError) {
      throw new Error(`Failed to fetch list items: ${itemsError.message}`);
    }

    return {
      ...(list as ShoppingList),
      items: items as ShoppingListItem[],
    };
  }

  async updateList(
    userId: string,
    id: string,
    updateListDto: UpdateShoppingListRequest,
  ): Promise<ShoppingList> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = { ...updateListDto };
    if (updateListDto.is_active === false) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('shopping_lists')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Shopping list with ID ${id} not found`);
    }

    return data as ShoppingList;
  }

  async removeList(userId: string, id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new NotFoundException(`Shopping list with ID ${id} not found`);
    }
  }

  async addItem(
    userId: string,
    listId: string,
    addItemDto: AddToShoppingListRequest,
  ): Promise<ShoppingListItem> {
    const supabase = this.supabaseService.getClient();

    // Verify list belongs to user
    const { data: list } = await supabase
      .from('shopping_lists')
      .select('id')
      .eq('id', listId)
      .eq('user_id', userId)
      .single();

    if (!list) {
      throw new NotFoundException(`Shopping list with ID ${listId} not found`);
    }

    const { data, error } = await supabase
      .from('shopping_list_items')
      .insert({
        ...addItemDto,
        shopping_list_id: listId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add item: ${error.message}`);
    }

    return data as ShoppingListItem;
  }

  async updateItem(
    userId: string,
    listId: string,
    itemId: string,
    updateItemDto: UpdateShoppingListItemRequest,
  ): Promise<ShoppingListItem> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = { ...updateItemDto };
    if (updateItemDto.is_checked) {
      updateData.checked_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('shopping_list_items')
      .update(updateData)
      .eq('id', itemId)
      .eq('shopping_list_id', listId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Shopping list item with ID ${itemId} not found`);
    }

    return data as ShoppingListItem;
  }

  async removeItem(userId: string, listId: string, itemId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', itemId)
      .eq('shopping_list_id', listId);

    if (error) {
      throw new NotFoundException(`Shopping list item with ID ${itemId} not found`);
    }
  }

  async generateList(
    userId: string,
    generateDto: GenerateShoppingListRequest,
  ): Promise<ShoppingList & { items: ShoppingListItem[] }> {
    const supabase = this.supabaseService.getClient();

    // Create new shopping list
    const { data: list, error: listError } = await supabase
      .from('shopping_lists')
      .insert({
        name: 'Auto-generated List',
        user_id: userId,
      })
      .select()
      .single();

    if (listError) {
      throw new Error(`Failed to create shopping list: ${listError.message}`);
    }

    const itemsToAdd: AddToShoppingListRequest[] = [];

    // Add items from recipes
    if (generateDto.recipe_ids && generateDto.recipe_ids.length > 0) {
      const { data: ingredients } = await supabase
        .from('recipe_ingredients')
        .select('*, product:products(*)')
        .in('recipe_id', generateDto.recipe_ids);

      ingredients?.forEach((ing: any) => {
        itemsToAdd.push({
          product_id: ing.product_id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: `For recipe`,
        });
      });
    }

    // Add expiring items
    if (generateDto.auto_add_expiring) {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const { data: expiringItems } = await supabase
        .from('inventory_items')
        .select('*, product:products(*)')
        .eq('user_id', userId)
        .eq('is_consumed', false)
        .lte('expiration_date', sevenDaysFromNow.toISOString());

      expiringItems?.forEach((item: any) => {
        itemsToAdd.push({
          product_id: item.product_id,
          name: item.product?.name || 'Unknown',
          quantity: item.quantity,
          unit: item.unit,
          notes: `Expiring soon`,
        });
      });
    }

    // Insert all items
    if (itemsToAdd.length > 0) {
      const itemsData = itemsToAdd.map((item) => ({
        ...item,
        shopping_list_id: list.id,
      }));

      await supabase.from('shopping_list_items').insert(itemsData);
    }

    return this.findOneList(userId, list.id);
  }
}