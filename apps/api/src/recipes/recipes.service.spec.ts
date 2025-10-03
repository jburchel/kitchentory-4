import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('RecipesService', () => {
  let service: RecipesService;
  let mockSupabaseClient: any;

  const mockSupabaseService = {
    getClient: jest.fn(),
  };

  beforeEach(async () => {
    // Create a thenable mock that supports both method chaining and promise resolution
    mockSupabaseClient = {
      then: jest.fn((resolve) => resolve({ data: null, error: null })),
    };

    const methods = ['from', 'select', 'insert', 'update', 'delete', 'eq', 'or', 'ilike', 'contains', 'range', 'order', 'single'];

    methods.forEach((method) => {
      mockSupabaseClient[method] = jest.fn(() => mockSupabaseClient);
    });

    mockSupabaseService.getClient.mockReturnValue(mockSupabaseClient);

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

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: mockCreatedRecipe,
          error: null,
        })
      );

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

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: null,
          error: { message: 'Creation failed' },
        })
      );

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

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: mockRecipes,
          error: null,
        })
      );

      const result = await service.findAll('user-123', {});

      expect(result.items).toEqual(mockRecipes);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes');
    });

    it('should filter by cuisine', async () => {
      const cuisine = 'italian';

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: [],
          error: null,
        })
      );

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
      };
      const mockIngredients = [
        { id: 'ing-1', name: 'Pasta', quantity: 200, unit: 'g' },
      ];

      // Mock needs to handle two queries: recipe, then ingredients
      let callCount = 0;
      mockSupabaseClient.then.mockImplementation((resolve) => {
        callCount++;
        if (callCount === 1) {
          // First call - recipe query
          return resolve({
            data: mockRecipe,
            error: null,
          });
        } else {
          // Second call - ingredients query
          return resolve({
            data: mockIngredients,
            error: null,
          });
        }
      });

      const result = await service.findOne('user-123', recipeId);

      expect(result).toEqual({
        ...mockRecipe,
        ingredients: mockIngredients,
      });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes');
    });

    it('should throw error for non-existent recipe', async () => {
      const recipeId = 'non-existent';

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: null,
          error: { message: 'Recipe not found' },
        })
      );

      await expect(service.findOne('user-123', recipeId)).rejects.toThrow();
    });
  });

  describe('findAvailable', () => {
    it('should return recipes that can be made with available inventory', async () => {
      const userId = 'user-123';

      // Mock the promise resolution
      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
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
        })
      );

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

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: mockUpdatedRecipe,
          error: null,
        })
      );

      const result = await service.update(userId, recipeId, updateDto);

      expect(result).toEqual(mockUpdatedRecipe);
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a recipe', async () => {
      const userId = 'user-123';
      const recipeId = 'recipe-123';

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          error: null,
        })
      );

      await service.remove(userId, recipeId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipes');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
    });
  });
});
