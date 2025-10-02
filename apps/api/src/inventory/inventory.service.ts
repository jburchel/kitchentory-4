import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  InventoryItem,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  InventoryQuery,
  PaginatedResponse,
} from '@kitchentory/shared';

@Injectable()
export class InventoryService {
  constructor(private supabaseService: SupabaseService) {}

  async create(
    userId: string,
    createInventoryDto: CreateInventoryItemRequest,
  ): Promise<InventoryItem> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        ...createInventoryDto,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create inventory item: ${error.message}`);
    }

    return data as InventoryItem;
  }

  async findAll(
    userId: string,
    query: InventoryQuery,
  ): Promise<PaginatedResponse<InventoryItem>> {
    const supabase = this.supabaseService.getClient();
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let queryBuilder = supabase
      .from('inventory_items')
      .select('*, product:products(*)', { count: 'exact' })
      .eq('user_id', userId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (query.location) {
      queryBuilder = queryBuilder.eq('location', query.location);
    }

    if (query.consumed !== undefined) {
      queryBuilder = queryBuilder.eq('is_consumed', query.consumed);
    } else {
      queryBuilder = queryBuilder.eq('is_consumed', false);
    }

    if (query.expiring_soon) {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      queryBuilder = queryBuilder
        .lte('expiration_date', sevenDaysFromNow.toISOString())
        .gte('expiration_date', new Date().toISOString());
    }

    if (query.expired) {
      queryBuilder = queryBuilder.lt('expiration_date', new Date().toISOString());
    }

    const { data, error, count } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to fetch inventory: ${error.message}`);
    }

    return {
      items: data as InventoryItem[],
      total: count || 0,
      page,
      limit,
      hasMore: offset + limit < (count || 0),
    };
  }

  async findOne(userId: string, id: string): Promise<InventoryItem> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*, product:products(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return data as InventoryItem;
  }

  async update(
    userId: string,
    id: string,
    updateInventoryDto: UpdateInventoryItemRequest,
  ): Promise<InventoryItem> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = { ...updateInventoryDto };
    if (updateInventoryDto.is_consumed) {
      updateData.consumed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, product:products(*)')
      .single();

    if (error || !data) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return data as InventoryItem;
  }

  async remove(userId: string, id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }
  }

  async getExpiringItems(userId: string, days: number = 7): Promise<InventoryItem[]> {
    const supabase = this.supabaseService.getClient();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*, product:products(*)')
      .eq('user_id', userId)
      .eq('is_consumed', false)
      .lte('expiration_date', futureDate.toISOString())
      .gte('expiration_date', new Date().toISOString())
      .order('expiration_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch expiring items: ${error.message}`);
    }

    return data as InventoryItem[];
  }
}