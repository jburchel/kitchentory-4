import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let supabaseService: SupabaseService;
  let jwtService: JwtService;

  const mockSupabaseClient = {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      refreshSession: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
  };

  const mockSupabaseService = {
    getClient: jest.fn(() => mockSupabaseClient),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'mock-jwt-token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'jwt.secret': 'test-secret',
        'jwt.expiresIn': '7d',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const mockAuthData = {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { access_token: 'access-token', refresh_token: 'refresh-token' },
      };

      const mockUserProfile = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      mockSupabaseClient.single.mockResolvedValue({
        data: mockUserProfile,
        error: null,
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.user).toEqual(mockUserProfile);
      expect(result.access_token).toBe('mock-jwt-token');
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
      });
    });

    it('should throw error if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      });

      await expect(service.register(registerDto)).rejects.toThrow('User already registered');
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockAuthData = {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { access_token: 'access-token', refresh_token: 'refresh-token' },
      };

      const mockUserProfile = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      mockSupabaseClient.single.mockResolvedValue({
        data: mockUserProfile,
        error: null,
      });

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.user).toEqual(mockUserProfile);
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: loginDto.email,
        password: loginDto.password,
      });
    });

    it('should throw error for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      await expect(service.login(loginDto)).rejects.toThrow();
    });
  });

  describe('validateUser', () => {
    it('should return user data for valid user ID', async () => {
      const userId = 'user-123';
      const mockUserProfile = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockUserProfile,
        error: null,
      });

      const result = await service.validateUser(userId);

      expect(result).toEqual(mockUserProfile);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', userId);
    });

    it('should return null for invalid user ID', async () => {
      const userId = 'invalid-user';

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const result = await service.validateUser(userId);

      expect(result).toBeNull();
    });
  });
});
