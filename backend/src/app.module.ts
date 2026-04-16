import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { PostsModule } from './projects/posts/posts.module';
import { UploadsModule } from './uploads/uploads.module';
import { InvestmentsModule } from './investments/investments.module';
import { SettingsModule } from './settings/settings.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    PostsModule,
    UploadsModule,
    InvestmentsModule,
    SettingsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
