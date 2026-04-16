import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin' as any)
  getAll() {
    return this.settings.getAll();
  }

  @Get('public')
  async getPublic() {
    const all = await this.settings.getAll();
    return {
      contact_email: all['contact_email'] ?? '',
      transfer_instructions: all['transfer_instructions'] ?? '',
      calendly_url: all['calendly_url'] ?? '',
    };
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin' as any)
  async update(@Body() body: Record<string, string>) {
    await this.settings.setMany(body);
    return { success: true };
  }
}
