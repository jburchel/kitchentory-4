import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => {
  const config = {
    url: process.env.SUPABASE_URL || 'http://localhost:54321',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
    jwtSecret: process.env.JWT_SECRET || 'development-secret',
  };

  console.log('Supabase config loaded:', {
    hasUrl: !!config.url,
    hasAnonKey: !!config.anonKey,
    hasServiceKey: !!config.serviceKey,
    urlPrefix: config.url?.substring(0, 20),
    anonKeyPrefix: config.anonKey?.substring(0, 15),
    serviceKeyPrefix: config.serviceKey?.substring(0, 15),
  });

  if (!config.serviceKey) {
    console.error('CRITICAL: SUPABASE_SERVICE_KEY is not set!');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  }

  return config;
});