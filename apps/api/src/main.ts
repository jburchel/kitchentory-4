import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Environment check:', {
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
    supabaseUrlPrefix: process.env.SUPABASE_URL?.substring(0, 20),
    anonKeyPrefix: process.env.SUPABASE_ANON_KEY?.substring(0, 15),
    serviceKeyPrefix: process.env.SUPABASE_SERVICE_KEY?.substring(0, 15),
  });

  const app = await NestFactory.create(AppModule);

  // Enable CORS for all origins
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
