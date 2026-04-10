import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  private supabase: SupabaseClient;
  private bucket = 'uploads';
  private logger = new Logger(UploadsService.name);

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      config.getOrThrow('SUPABASE_URL'),
      config.getOrThrow('SUPABASE_SERVICE_KEY'),
    );
  }

  async upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; path: string }> {
    const ext = file.originalname.split('.').pop() ?? 'bin';
    const path = `${folder}/${randomUUID()}.${ext}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Upload failed: ${error.message}`);
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(path);

    return { url: data.publicUrl, path };
  }
}
