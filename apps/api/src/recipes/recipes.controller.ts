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
import { RecipesService } from './recipes.service';
import {
  CreateRecipeRequest,
  UpdateRecipeRequest,
  RecipeSearchQuery,
  ApiResponse,
  PaginatedResponse,
  Recipe,
} from '@kitchentory/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Body() createRecipeDto: CreateRecipeRequest,
  ): Promise<ApiResponse<Recipe>> {
    const recipe = await this.recipesService.create(req.user.id, createRecipeDto);
    return {
      success: true,
      data: recipe,
      message: 'Recipe created successfully',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req,
    @Query() query: RecipeSearchQuery,
  ): Promise<ApiResponse<PaginatedResponse<Recipe>>> {
    const recipes = await this.recipesService.findAll(req.user.id, query);
    return {
      success: true,
      data: recipes,
    };
  }

  @Get('available')
  @UseGuards(JwtAuthGuard)
  async findAvailable(
    @Request() req,
    @Query() query: RecipeSearchQuery,
  ): Promise<ApiResponse<Recipe[]>> {
    const recipes = await this.recipesService.findAvailable(req.user.id, query);
    return {
      success: true,
      data: recipes,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string): Promise<ApiResponse<any>> {
    const recipe = await this.recipesService.findOne(req.user.id, id);
    return {
      success: true,
      data: recipe,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeRequest,
  ): Promise<ApiResponse<Recipe>> {
    const recipe = await this.recipesService.update(req.user.id, id, updateRecipeDto);
    return {
      success: true,
      data: recipe,
      message: 'Recipe updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') id: string): Promise<ApiResponse<void>> {
    await this.recipesService.remove(req.user.id, id);
    return {
      success: true,
      message: 'Recipe deleted successfully',
    };
  }
}