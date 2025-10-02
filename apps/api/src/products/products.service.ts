import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductSearchQuery,
  PaginatedResponse,
} from '@kitchentory/shared';

@Injectable()
export class ProductsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createProductDto: CreateProductRequest): Promise<Product> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('products')
      .insert(createProductDto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return data as Product;
  }

  async findAll(query: ProductSearchQuery): Promise<PaginatedResponse<Product>> {
    const supabase = this.supabaseService.getClient();
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let queryBuilder = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (query.q) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query.q}%,brand.ilike.%${query.q}%`,
      );
    }

    if (query.category_id) {
      queryBuilder = queryBuilder.eq('category_id', query.category_id);
    }

    if (query.barcode) {
      queryBuilder = queryBuilder.eq('barcode', query.barcode);
    }

    const { data, error, count } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return {
      items: data as Product[],
      total: count || 0,
      page,
      limit,
      hasMore: offset + limit < (count || 0),
    };
  }

  async findOne(id: string): Promise<Product> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return data as Product;
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (error) {
      return null;
    }

    return data as Product;
  }

  async update(id: string, updateProductDto: UpdateProductRequest): Promise<Product> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('products')
      .update(updateProductDto)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return data as Product;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}