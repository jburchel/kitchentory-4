import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('RecipesService', () => {
  let service: RecipesService;

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    order: jest.fn(),
    single: jest.fn(),
  };

  const mockSupabaseService = {
    getClient: jest.fn(() => mockSupabaseClient),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new recipe', async () => {
      const userId = 'user-123';
      const createDto = {
        name: 'Pasta Carbonara',
        description: 'Classic Italian pasta dish',
        instructions: ['Boil pasta', 'Mix eggs and cheese', 'Combine'],
        servings: 4,
        prep_time_minutes: 10,
        cook_time_minutes: 20,
        difficulty: 'medium' as const,
        dietary_tags: ['vegetarian' as const],
        ingredients: [
          { name: 'Pasta', quantity: 200, unit: 'g' as const, is_optional: false },
        ],
      };

      const mockCreatedRecipe = {
        id: 'recipe-123',
        ...createDto,
        created_by: userId,
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockCreatedRecipe,
        error: null,
      });

      const result = await service.create(userId, createDto);

      expect(result).toEqual(mockCreatedRecipe);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes');
    });

    it('should throw error when creation fails', async () => {
      const userId = 'user-123';
      const createDto = {
        name: 'Test Recipe',
        instructions: ['Step 1'],
        servings: 2,
        dietary_tags: [],
        ingredients: [],
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Creation failed' },
      });

      await expect(service.create(userId, createDto)).rejects.toThrow('Creation failed');
    });
  });

  describe('findAll', () => {
    it('should return all recipes', async () => {
      const mockRecipes = [
        {
          id: 'recipe-1',
          name: 'Recipe 1',
          servings: 4,
          is_public: true,
        },
        {
          id: 'recipe-2',
          name: 'Recipe 2',
          servings: 2,
          is_public: true,
        },
      ];

      mockSupabaseClient.order.mockResolvedValue({
        data: mockRecipes,
        error: null,
      });

      const result = await service.findAll('user-123', {});

      expect(result.items).toEqual(mockRecipes);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes');
    });

    it('should filter by cuisine', async () => {
      const cuisine = 'italian';

      mockSupabaseClient.order.mockResolvedValue({
        data: [],
        error: null,
      });

      await service.findAll('user-123', { cuisine });

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('cuisine', cuisine);
    });
  });

  describe('findOne', () => {
    it('should return a single recipe with ingredients', async () => {
      const recipeId = 'recipe-123';
      const mockRecipe = {
        id: recipeId,
        name: 'Test Recipe',
        servings: 4,
        ingredients: [
          { id: 'ing-1', name: 'Pasta', quantity: 200, unit: 'g' },
        ],
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockRecipe,
        error: null,
      });

      const result = await service.findOne('user-123', recipeId);

      expect(result).toEqual(mockRecipe);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes');
    });

    it('should throw error for non-existent recipe', async () => {
      const recipeId = 'non-existent';

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Recipe not found' },
      });

      await expect(service.findOne('user-123', recipeId)).rejects.toThrow();
    });
  });

  describe('findAvailable', () => {
    it('should return recipes that can be made with available inventory', async () => {
      const userId = 'user-123';

      // Mock the order method which is the final call in the chain
      mockSupabaseClient.order.mockResolvedValue({
        data: [
          {
            id: 'recipe-1',
            name: 'Available Recipe',
            ingredients: [
              { product_id: 'product-1', quantity: 200, is_optional: false },
            ],
          },
        ],
        error: null,
      });

      const result = await service.findAvailable(userId, {});

      // Should return recipes
      expect(Array.isArray(result)).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a recipe', async () => {
      const userId = 'user-123';
      const recipeId = 'recipe-123';
      const updateDto = {
        name: 'Updated Recipe Name',
        servings: 6,
      };

      const mockUpdatedRecipe = {
        id: recipeId,
        name: 'Updated Recipe Name',
        servings: 6,
        created_by: userId,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockUpdatedRecipe,
        error: null,
      });

      const result = await service.update(userId, recipeId, updateDto);

      expect(result).toEqual(mockUpdatedRecipe);
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a recipe', async () => {
      const userId = 'user-123';
      const recipeId = 'recipe-123';

      mockSupabaseClient.eq.mockResolvedValue({
        error: null,
      });

      await service.remove(userId, recipeId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
    });
  });
});
