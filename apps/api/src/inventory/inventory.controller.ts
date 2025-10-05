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
  Request,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  InventoryQuery,
  ApiResponse,
  PaginatedResponse,
  InventoryItem,
} from '@kitchentory/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async create(
    @Request() req,
    @Body() createInventoryDto: CreateInventoryItemRequest,
  ): Promise<ApiResponse<InventoryItem>> {
    const item = await this.inventoryService.create(req.user.id, createInventoryDto);
    return {
      success: true,
      data: item,
      message: 'Inventory item created successfully',
    };
  }

  @Get()
  async findAll(
    @Request() req,
    @Query() query: InventoryQuery,
  ): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    try {
      console.log('Inventory GET - req.user:', req.user);
      console.log('Inventory GET - req.user.id:', req.user?.id);
      const items = await this.inventoryService.findAll(req.user.id, query);
      console.log('Inventory GET - items:', items);
      return {
        success: true,
        data: items,
      };
    } catch (error) {
      console.error('Inventory GET ERROR:', error);
      throw error;
    }
  }

  @Get('expiring')
  async getExpiring(@Request() req, @Query('days') days?: number): Promise<ApiResponse<InventoryItem[]>> {
    const items = await this.inventoryService.getExpiringItems(
      req.user.id,
      days ? parseInt(days.toString()) : 7,
    );
    return {
      success: true,
      data: items,
    };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string): Promise<ApiResponse<InventoryItem>> {
    const item = await this.inventoryService.findOne(req.user.id, id);
    return {
      success: true,
      data: item,
    };
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryItemRequest,
  ): Promise<ApiResponse<InventoryItem>> {
    const item = await this.inventoryService.update(req.user.id, id, updateInventoryDto);
    return {
      success: true,
      data: item,
      message: 'Inventory item updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string): Promise<ApiResponse<void>> {
    await this.inventoryService.remove(req.user.id, id);
    return {
      success: true,
      message: 'Inventory item deleted successfully',
    };
  }
}