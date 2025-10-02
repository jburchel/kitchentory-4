import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest, ApiResponse, AuthResponse, User } from '@kitchentory/shared';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const authResponse = await this.authService.register(registerDto);
    return {
      success: true,
      data: authResponse,
      message: 'User registered successfully',
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const authResponse = await this.authService.login(loginDto);
    return {
      success: true,
      data: authResponse,
      message: 'Login successful',
    };
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const authResponse = await this.authService.refreshToken(refreshToken);
    return {
      success: true,
      data: authResponse,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<ApiResponse<User>> {
    return {
      success: true,
      data: req.user,
    };
  }
}