import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingService } from './shopping.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NotFoundException } from '@nestjs/common';

describe('ShoppingService', () => {
  let service: ShoppingService;
  let mockSupabaseClient: any;

  const mockSupabaseService = {
    getClient: jest.fn(),
  };

  beforeEach(async () => {
    // Create a thenable mock that supports both method chaining and promise resolution
    mockSupabaseClient = {
      then: jest.fn((resolve) => resolve({ data: null, error: null })),
    };

    const methods = ['from', 'select', 'insert', 'update', 'delete', 'eq', 'in', 'lte', 'order', 'single'];

    methods.forEach((method) => {
      mockSupabaseClient[method] = jest.fn(() => mockSupabaseClient);
    });

    mockSupabaseService.getClient.mockReturnValue(mockSupabaseClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShoppingService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<ShoppingService>(ShoppingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createList', () => {
    it('should create a new shopping list', async () => {
      const userId = 'user-123';
      const createDto = {
        name: 'Weekly Groceries',
        description: 'Groceries for this week',
      };

      const mockList = {
        id: 'list-123',
        user_id: userId,
        name: 'Weekly Groceries',
        description: 'Groceries for this week',
        is_active: true,
        created_at: new Date().toISOString(),
      };

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: mockList,
          error: null,
        })
      );

      const result = await service.createList(userId, createDto);

      expect(result).toEqual(mockList);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('shopping_lists');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    it('should throw error when creation fails', async () => {
      const userId = 'user-123';
      const createDto = {
        name: 'Weekly Groceries',
      };

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: null,
          error: { message: 'Creation failed' },
        })
      );

      await expect(service.createList(userId, createDto)).rejects.toThrow('Failed to create shopping list');
    });
  });

  describe('findAllLists', () => {
    it('should return all shopping lists for a user', async () => {
      const userId = 'user-123';
      const mockLists = [
        {
          id: 'list-1',
          user_id: userId,
          name: 'Weekly Groceries',
          is_active: true,
        },
        {
          id: 'list-2',
          user_id: userId,
          name: 'Party Shopping',
          is_active: false,
        },
      ];

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: mockLists,
          error: null,
        })
      );

      const result = await service.findAllLists(userId);

      expect(result).toEqual(mockLists);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('shopping_lists');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', userId);
    });
  });

  describe('findOneList', () => {
    it('should return a shopping list with items', async () => {
      const userId = 'user-123';
      const listId = 'list-123';
      const mockList = {
        id: listId,
        user_id: userId,
        name: 'Weekly Groceries',
        is_active: true,
      };
      const mockItems = [
        {
          id: 'item-1',
          shopping_list_id: listId,
          name: 'Milk',
          quantity: 2,
          unit: 'liter',
          is_checked: false,
        },
      ];

      // Mock needs to handle two queries: list, then items
      let callCount = 0;
      mockSupabaseClient.then.mockImplementation((resolve) => {
        callCount++;
        if (callCount === 1) {
          // First call - list query
          return resolve({
            data: mockList,
            error: null,
          });
        } else {
          // Second call - items query
          return resolve({
            data: mockItems,
            error: null,
          });
        }
      });

      const result = await service.findOneList(userId, listId);

      expect(result).toEqual({
        ...mockList,
        items: mockItems,
      });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('shopping_lists');
    });

    it('should throw NotFoundException for non-existent list', async () => {
      const userId = 'user-123';
      const listId = 'non-existent';

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: null,
          error: { message: 'Not found' },
        })
      );

      await expect(service.findOneList(userId, listId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateList', () => {
    it('should update a shopping list', async () => {
      const userId = 'user-123';
      const listId = 'list-123';
      const updateDto = {
        name: 'Updated Groceries',
        is_active: false,
      };

      const mockUpdatedList = {
        id: listId,
        user_id: userId,
        name: 'Updated Groceries',
        is_active: false,
        completed_at: new Date().toISOString(),
      };

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: mockUpdatedList,
          error: null,
        })
      );

      const result = await service.updateList(userId, listId, updateDto);

      expect(result).toEqual(mockUpdatedList);
      expect(mockSupabaseClient.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent list', async () => {
      const userId = 'user-123';
      const listId = 'non-existent';
      const updateDto = { name: 'Updated' };

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: null,
          error: { message: 'Not found' },
        })
      );

      await expect(service.updateList(userId, listId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeList', () => {
    it('should delete a shopping list', async () => {
      const userId = 'user-123';
      const listId = 'list-123';

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          error: null,
        })
      );

      await service.removeList(userId, listId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('shopping_lists');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when delete fails', async () => {
      const userId = 'user-123';
      const listId = 'non-existent';

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          error: { message: 'Not found' },
        })
      );

      await expect(service.removeList(userId, listId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addItem', () => {
    it('should add an item to a shopping list', async () => {
      const userId = 'user-123';
      const listId = 'list-123';
      const addItemDto = {
        product_id: 'product-123',
        name: 'Milk',
        quantity: 2,
        unit: 'item' as const,
      };

      const mockItem = {
        id: 'item-123',
        shopping_list_id: listId,
        product_id: 'product-123',
        name: 'Milk',
        quantity: 2,
        unit: 'item',
        is_checked: false,
      };

      // First call verifies list, second call adds item
      let callCount = 0;
      mockSupabaseClient.then.mockImplementation((resolve) => {
        callCount++;
        if (callCount === 1) {
          return resolve({
            data: { id: listId },
            error: null,
          });
        } else {
          return resolve({
            data: mockItem,
            error: null,
          });
        }
      });

      const result = await service.addItem(userId, listId, addItemDto);

      expect(result).toEqual(mockItem);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('shopping_lists');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('shopping_list_items');
    });

    it('should throw NotFoundException for non-existent list', async () => {
      const userId = 'user-123';
      const listId = 'non-existent';
      const addItemDto = {
        product_id: 'product-123',
        name: 'Milk',
        quantity: 2,
        unit: 'item' as const,
      };

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: null,
          error: null,
        })
      );

      await expect(service.addItem(userId, listId, addItemDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateItem', () => {
    it('should update a shopping list item', async () => {
      const userId = 'user-123';
      const listId = 'list-123';
      const itemId = 'item-123';
      const updateDto = {
        is_checked: true,
        quantity: 3,
      };

      const mockUpdatedItem = {
        id: itemId,
        shopping_list_id: listId,
        name: 'Milk',
        quantity: 3,
        is_checked: true,
        checked_at: new Date().toISOString(),
      };

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: mockUpdatedItem,
          error: null,
        })
      );

      const result = await service.updateItem(userId, listId, itemId, updateDto);

      expect(result).toEqual(mockUpdatedItem);
      expect(mockSupabaseClient.update).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should delete a shopping list item', async () => {
      const userId = 'user-123';
      const listId = 'list-123';
      const itemId = 'item-123';

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          error: null,
        })
      );

      await service.removeItem(userId, listId, itemId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('shopping_list_items');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
    });
  });

  describe('generateList', () => {
    it('should generate a shopping list from recipes', async () => {
      const userId = 'user-123';
      const generateDto = {
        recipe_ids: ['recipe-1', 'recipe-2'],
        auto_add_expiring: false,
      };

      const mockList = {
        id: 'list-123',
        user_id: userId,
        name: 'Auto-generated List',
        is_active: true,
      };

      const mockIngredients = [
        {
          product_id: 'product-1',
          name: 'Tomatoes',
          quantity: 4,
          unit: 'item',
        },
      ];

      const mockItems = [
        {
          id: 'item-1',
          shopping_list_id: 'list-123',
          product_id: 'product-1',
          name: 'Tomatoes',
          quantity: 4,
          unit: 'item',
        },
      ];

      // Multiple queries: create list, get ingredients, findOneList (list + items)
      let callCount = 0;
      mockSupabaseClient.then.mockImplementation((resolve) => {
        callCount++;
        if (callCount === 1) {
          // Create list
          return resolve({ data: mockList, error: null });
        } else if (callCount === 2) {
          // Get ingredients from recipes
          return resolve({ data: mockIngredients, error: null });
        } else if (callCount === 3) {
          // Insert items (void return)
          return resolve({ data: null, error: null });
        } else if (callCount === 4) {
          // findOneList - get list
          return resolve({ data: mockList, error: null });
        } else {
          // findOneList - get items
          return resolve({ data: mockItems, error: null });
        }
      });

      const result = await service.generateList(userId, generateDto);

      expect(result.id).toEqual(mockList.id);
      expect(result.items).toEqual(mockItems);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('shopping_lists');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('recipe_ingredients');
    });
  });
});
