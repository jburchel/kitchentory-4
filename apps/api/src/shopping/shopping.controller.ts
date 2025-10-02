import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShoppingService } from './shopping.service';
import {
  CreateShoppingListRequest,
  UpdateShoppingListRequest,
  AddToShoppingListRequest,
  UpdateShoppingListItemRequest,
  GenerateShoppingListRequest,
  ApiResponse,
  ShoppingList,
  ShoppingListItem,
} from '@kitchentory/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('shopping')
@UseGuards(JwtAuthGuard)
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Post('lists')
  async createList(
    @Request() req,
    @Body() createListDto: CreateShoppingListRequest,
  ): Promise<ApiResponse<ShoppingList>> {
    const list = await this.shoppingService.createList(req.user.id, createListDto);
    return {
      success: true,
      data: list,
      message: 'Shopping list created successfully',
    };
  }

  @Get('lists')
  async findAllLists(@Request() req): Promise<ApiResponse<ShoppingList[]>> {
    const lists = await this.shoppingService.findAllLists(req.user.id);
    return {
      success: true,
      data: lists,
    };
  }

  @Get('lists/:id')
  async findOneList(@Request() req, @Param('id') id: string): Promise<ApiResponse<any>> {
    const list = await this.shoppingService.findOneList(req.user.id, id);
    return {
      success: true,
      data: list,
    };
  }

  @Patch('lists/:id')
  async updateList(
    @Request() req,
    @Param('id') id: string,
    @Body() updateListDto: UpdateShoppingListRequest,
  ): Promise<ApiResponse<ShoppingList>> {
    const list = await this.shoppingService.updateList(req.user.id, id, updateListDto);
    return {
      success: true,
      data: list,
      message: 'Shopping list updated successfully',
    };
  }

  @Delete('lists/:id')
  async removeList(@Request() req, @Param('id') id: string): Promise<ApiResponse<void>> {
    await this.shoppingService.removeList(req.user.id, id);
    return {
      success: true,
      message: 'Shopping list deleted successfully',
    };
  }

  @Post('lists/:id/items')
  async addItem(
    @Request() req,
    @Param('id') listId: string,
    @Body() addItemDto: AddToShoppingListRequest,
  ): Promise<ApiResponse<ShoppingListItem>> {
    const item = await this.shoppingService.addItem(req.user.id, listId, addItemDto);
    return {
      success: true,
      data: item,
      message: 'Item added to shopping list',
    };
  }

  @Patch('lists/:listId/items/:itemId')
  async updateItem(
    @Request() req,
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateShoppingListItemRequest,
  ): Promise<ApiResponse<ShoppingListItem>> {
    const item = await this.shoppingService.updateItem(
      req.user.id,
      listId,
      itemId,
      updateItemDto,
    );
    return {
      success: true,
      data: item,
      message: 'Item updated successfully',
    };
  }

  @Delete('lists/:listId/items/:itemId')
  async removeItem(
    @Request() req,
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
  ): Promise<ApiResponse<void>> {
    await this.shoppingService.removeItem(req.user.id, listId, itemId);
    return {
      success: true,
      message: 'Item removed from shopping list',
    };
  }

  @Post('generate')
  async generate(
    @Request() req,
    @Body() generateDto: GenerateShoppingListRequest,
  ): Promise<ApiResponse<any>> {
    const list = await this.shoppingService.generateList(req.user.id, generateDto);
    return {
      success: true,
      data: list,
      message: 'Shopping list generated successfully',
    };
  }
}