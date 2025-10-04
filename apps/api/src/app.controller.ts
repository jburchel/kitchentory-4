import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('debug/env')
  getEnvDebug() {
    return {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      hasJwtSecret: !!process.env.JWT_SECRET,
      supabaseUrlPrefix: process.env.SUPABASE_URL?.substring(0, 20),
      anonKeyPrefix: process.env.SUPABASE_ANON_KEY?.substring(0, 15),
      serviceKeyPrefix: process.env.SUPABASE_SERVICE_KEY?.substring(0, 15),
      nodeEnv: process.env.NODE_ENV,
    };
  }
}
