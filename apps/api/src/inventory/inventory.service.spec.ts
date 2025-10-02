import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('InventoryService', () => {
  let service: InventoryService;

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  const mockSupabaseService = {
    getClient: jest.fn(() => mockSupabaseClient),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new inventory item', async () => {
      const userId = 'user-123';
      const createDto = {
        product_id: 'product-123',
        quantity: 2,
        unit: 'item' as const,
        location: 'fridge' as const,
        expiration_date: '2025-12-31',
      };

      const mockCreatedItem = {
        id: 'item-123',
        user_id: userId,
        household_id: null,
        product_id: 'product-123',
        added_by: userId,
        quantity: 2,
        unit: 'item',
        location: 'fridge',
        expiration_date: '2025-12-31',
        purchase_date: null,
        purchase_price: null,
        notes: null,
        is_consumed: false,
        consumed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockCreatedItem,
        error: null,
      });

      const result = await service.create(userId, createDto);

      expect(result).toEqual(mockCreatedItem);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('inventory_items');
    });

    it('should throw error when creation fails', async () => {
      const userId = 'user-123';
      const createDto = {
        product_id: 'product-123',
        quantity: 2,
        unit: 'item' as const,
        location: 'fridge' as const,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Creation failed' },
      });

      await expect(service.create(userId, createDto)).rejects.toThrow('Creation failed');
    });
  });

  describe('findAll', () => {
    it('should return paginated inventory items for a user', async () => {
      const userId = 'user-123';
      const mockItems = [
        {
          id: 'item-1',
          user_id: userId,
          product_id: 'product-1',
          quantity: 2,
          unit: 'item',
          location: 'fridge',
          is_consumed: false,
        },
      ];

      // Mock the final method in the chain (order)
      mockSupabaseClient.order.mockResolvedValue({
        data: mockItems,
        error: null,
        count: 1,
      });

      const result = await service.findAll(userId, {});

      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('inventory_items');
    });
  });

  describe('findOne', () => {
    it('should return a single inventory item', async () => {
      const userId = 'user-123';
      const itemId = 'item-123';
      const mockItem = {
        id: itemId,
        user_id: userId,
        product_id: 'product-123',
        quantity: 2,
        unit: 'item',
        location: 'fridge',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockItem,
        error: null,
      });

      const result = await service.findOne(userId, itemId);

      expect(result).toEqual(mockItem);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('inventory_items');
    });

    it('should throw error for non-existent item', async () => {
      const userId = 'user-123';
      const itemId = 'non-existent';

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Item not found' },
      });

      await expect(service.findOne(userId, itemId)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an inventory item', async () => {
      const userId = 'user-123';
      const itemId = 'item-123';
      const updateDto = {
        quantity: 5,
        location: 'freezer' as const,
      };

      const mockUpdatedItem = {
        id: itemId,
        user_id: userId,
        product_id: 'product-123',
        quantity: 5,
        location: 'freezer',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockUpdatedItem,
        error: null,
      });

      const result = await service.update(userId, itemId, updateDto);

      expect(result).toEqual(mockUpdatedItem);
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(updateDto);
    });
  });

  describe('remove', () => {
    it('should delete an inventory item', async () => {
      const userId = 'user-123';
      const itemId = 'item-123';

      mockSupabaseClient.eq.mockResolvedValue({
        error: null,
      });

      await service.remove(userId, itemId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('inventory_items');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
    });
  });

  describe('getExpiringItems', () => {
    it('should return items expiring within specified days', async () => {
      const userId = 'user-123';
      const days = 7;
      const mockExpiringItems = [
        {
          id: 'item-1',
          user_id: userId,
          product_id: 'product-1',
          quantity: 1,
          unit: 'item',
          location: 'fridge',
          expiration_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // Mock the final method in the chain (order)
      mockSupabaseClient.order.mockResolvedValue({
        data: mockExpiringItems,
        error: null,
      });

      const result = await service.getExpiringItems(userId, days);

      expect(result).toEqual(mockExpiringItems);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('inventory_items');
    });
  });
});
