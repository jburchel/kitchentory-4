import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockSupabaseClient: any;

  const mockSupabaseService = {
    getClient: jest.fn(),
  };

  beforeEach(async () => {
    // Create a thenable mock that supports both method chaining and promise resolution
    mockSupabaseClient = {
      then: jest.fn((resolve) => resolve({ data: null, error: null })),
    };

    const methods = ['from', 'select', 'insert', 'update', 'delete', 'eq', 'or', 'range', 'order', 'single'];

    methods.forEach((method) => {
      mockSupabaseClient[method] = jest.fn(() => mockSupabaseClient);
    });

    mockSupabaseService.getClient.mockReturnValue(mockSupabaseClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createDto = {
        name: 'Organic Milk',
        brand: 'Happy Farm',
        category_id: 'cat-123',
        barcode: '1234567890',
        default_unit: 'item' as const,
      };

      const mockProduct = {
        id: 'product-123',
        name: 'Organic Milk',
        brand: 'Happy Farm',
        category_id: 'cat-123',
        barcode: '1234567890',
        default_unit: 'item',
        created_at: new Date().toISOString(),
      };

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: mockProduct,
          error: null,
        })
      );

      const result = await service.create(createDto);

      expect(result).toEqual(mockProduct);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(createDto);
    });

    it('should throw error when creation fails', async () => {
      const createDto = {
        name: 'Organic Milk',
        default_unit: 'item' as const,
      };

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: null,
          error: { message: 'Creation failed' },
        })
      );

      await expect(service.create(createDto)).rejects.toThrow('Failed to create product');
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Organic Milk',
          brand: 'Happy Farm',
          default_unit: 'item',
        },
        {
          id: 'product-2',
          name: 'Whole Wheat Bread',
          brand: 'Baker\'s Best',
          default_unit: 'item',
        },
      ];

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: mockProducts,
          error: null,
          count: 2,
        })
      );

      const result = await service.findAll({});

      expect(result.items).toEqual(mockProducts);
      expect(result.total).toBe(2);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products');
    });

    it('should filter by search query', async () => {
      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: [],
          error: null,
          count: 0,
        })
      );

      await service.findAll({ q: 'milk' });

      expect(mockSupabaseClient.or).toHaveBeenCalledWith(
        expect.stringContaining('milk')
      );
    });

    it('should filter by category', async () => {
      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: [],
          error: null,
          count: 0,
        })
      );

      await service.findAll({ category_id: 'cat-123' });

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('category_id', 'cat-123');
    });

    it('should filter by barcode', async () => {
      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: [],
          error: null,
          count: 0,
        })
      );

      await service.findAll({ barcode: '1234567890' });

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('barcode', '1234567890');
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const productId = 'product-123';
      const mockProduct = {
        id: productId,
        name: 'Organic Milk',
        brand: 'Happy Farm',
        default_unit: 'liter',
      };

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: mockProduct,
          error: null,
        })
      );

      const result = await service.findOne(productId);

      expect(result).toEqual(mockProduct);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', productId);
    });

    it('should throw NotFoundException for non-existent product', async () => {
      const productId = 'non-existent';

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: null,
          error: { message: 'Not found' },
        })
      );

      await expect(service.findOne(productId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByBarcode', () => {
    it('should return a product by barcode', async () => {
      const barcode = '1234567890';
      const mockProduct = {
        id: 'product-123',
        name: 'Organic Milk',
        barcode: '1234567890',
        default_unit: 'liter',
      };

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: mockProduct,
          error: null,
        })
      );

      const result = await service.findByBarcode(barcode);

      expect(result).toEqual(mockProduct);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('barcode', barcode);
    });

    it('should return null when barcode not found', async () => {
      const barcode = 'non-existent';

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: null,
          error: { message: 'Not found' },
        })
      );

      const result = await service.findByBarcode(barcode);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const productId = 'product-123';
      const updateDto = {
        name: 'Updated Milk',
        brand: 'New Brand',
      };

      const mockUpdatedProduct = {
        id: productId,
        name: 'Updated Milk',
        brand: 'New Brand',
        default_unit: 'liter',
      };

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: mockUpdatedProduct,
          error: null,
        })
      );

      const result = await service.update(productId, updateDto);

      expect(result).toEqual(mockUpdatedProduct);
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(updateDto);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', productId);
    });

    it('should throw NotFoundException for non-existent product', async () => {
      const productId = 'non-existent';
      const updateDto = { name: 'Updated' };

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          data: null,
          error: { message: 'Not found' },
        })
      );

      await expect(service.update(productId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const productId = 'product-123';

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          error: null,
        })
      );

      await service.remove(productId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', productId);
    });

    it('should throw NotFoundException when delete fails', async () => {
      const productId = 'non-existent';

      mockSupabaseClient.then.mockImplementation((resolve) =>
        resolve({
          error: { message: 'Not found' },
        })
      );

      await expect(service.remove(productId)).rejects.toThrow(NotFoundException);
    });
  });
});
