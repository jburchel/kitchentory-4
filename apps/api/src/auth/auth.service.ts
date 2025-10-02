import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@kitchentory/shared';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterRequest): Promise<AuthResponse> {
    const supabase = this.supabaseService.getClient();

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: registerDto.email,
      password: registerDto.password,
    });

    if (authError) {
      throw new UnauthorizedException(authError.message);
    }

    // Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: registerDto.email,
        name: registerDto.name,
      })
      .select()
      .single();

    if (userError) {
      // Cleanup auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new UnauthorizedException('Failed to create user profile');
    }

    const payload = { sub: authData.user.id, email: registerDto.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: userData as User,
      access_token: accessToken,
      refresh_token: authData.session?.refresh_token || '',
    };
  }

  async login(loginDto: LoginRequest): Promise<AuthResponse> {
    const supabase = this.supabaseService.getClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (authError) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      throw new UnauthorizedException('User profile not found');
    }

    const payload = { sub: authData.user.id, email: loginDto.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: userData as User,
      access_token: accessToken,
      refresh_token: authData.session?.refresh_token || '',
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    const supabase = this.supabaseService.getClient();

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return null;
    }

    return userData as User;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const supabase = this.supabaseService.getClient();

    const { data: authData, error: authError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (authError) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      throw new UnauthorizedException('User profile not found');
    }

    const payload = { sub: authData.user.id, email: authData.user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: userData as User,
      access_token: accessToken,
      refresh_token: authData.session?.refresh_token || '',
    };
  }
}