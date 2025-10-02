import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  CreateProductRequest,
  UpdateProductRequest,
  ProductSearchQuery,
  ApiResponse,
  PaginatedResponse,
  Product,
} from '@kitchentory/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createProductDto: CreateProductRequest,
  ): Promise<ApiResponse<Product>> {
    const product = await this.productsService.create(createProductDto);
    return {
      success: true,
      data: product,
      message: 'Product created successfully',
    };
  }

  @Get()
  async findAll(
    @Query() query: ProductSearchQuery,
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const products = await this.productsService.findAll(query);
    return {
      success: true,
      data: products,
    };
  }

  @Get('barcode/:barcode')
  async findByBarcode(@Param('barcode') barcode: string): Promise<ApiResponse<Product>> {
    const product = await this.productsService.findByBarcode(barcode);
    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      };
    }
    return {
      success: true,
      data: product,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Product>> {
    const product = await this.productsService.findOne(id);
    return {
      success: true,
      data: product,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductRequest,
  ): Promise<ApiResponse<Product>> {
    const product = await this.productsService.update(id, updateProductDto);
    return {
      success: true,
      data: product,
      message: 'Product updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    await this.productsService.remove(id);
    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
}