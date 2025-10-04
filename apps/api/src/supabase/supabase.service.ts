import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import supabaseConfig from '../config/supabase.config';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private anonClient: SupabaseClient;

  constructor(
    @Inject(supabaseConfig.KEY)
    private config: ConfigType<typeof supabaseConfig>,
  ) {
    this.supabase = createClient(config.url, config.serviceKey);
    this.anonClient = createClient(config.url, config.anonKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getAnonClient(): SupabaseClient {
    return this.anonClient;
  }

  getClientForUser(accessToken: string): SupabaseClient {
    return createClient(this.config.url, this.config.anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }
}