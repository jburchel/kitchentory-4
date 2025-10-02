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

      const result = await service.findAll({});

      expect(result).toEqual(mockRecipes);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes');
    });

    it('should filter by cuisine', async () => {
      const cuisine = 'italian';

      mockSupabaseClient.order.mockResolvedValue({
        data: [],
        error: null,
      });

      await service.findAll({ cuisine });

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

      const result = await service.findOne(recipeId);

      expect(result).toEqual(mockRecipe);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes');
    });

    it('should throw error for non-existent recipe', async () => {
      const recipeId = 'non-existent';

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Recipe not found' },
      });

      await expect(service.findOne(recipeId)).rejects.toThrow();
    });
  });

  describe('search', () => {
    it('should search recipes by query', async () => {
      const query = 'pasta';
      const mockRecipes = [
        {
          id: 'recipe-1',
          name: 'Pasta Carbonara',
        },
      ];

      mockSupabaseClient.order.mockResolvedValue({
        data: mockRecipes,
        error: null,
      });

      const result = await service.search(query);

      expect(result).toEqual(mockRecipes);
      expect(mockSupabaseClient.ilike).toHaveBeenCalled();
    });
  });

  describe('findAvailable', () => {
    it('should return recipes that can be made with available inventory', async () => {
      const userId = 'user-123';

      // Mock inventory items
      mockSupabaseClient.eq.mockResolvedValueOnce({
        data: [
          { product_id: 'product-1', quantity: 500 },
          { product_id: 'product-2', quantity: 100 },
        ],
        error: null,
      });

      // Mock recipes with ingredients
      mockSupabaseClient.order.mockResolvedValue({
        data: [
          {
            id: 'recipe-1',
            name: 'Available Recipe',
            ingredients: [
              { product_id: 'product-1', quantity: 200, is_optional: false },
            ],
          },
          {
            id: 'recipe-2',
            name: 'Unavailable Recipe',
            ingredients: [
              { product_id: 'product-3', quantity: 100, is_optional: false },
            ],
          },
        ],
        error: null,
      });

      const result = await service.findAvailable(userId);

      // Should only return recipes where user has all required ingredients
      expect(result.length).toBeGreaterThan(0);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('inventory_items');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes');
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
