import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { PostsModule } from './projects/posts/posts.module';
import { UploadsModule } from './uploads/uploads.module';
import { InvestmentsModule } from './investments/investments.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    PostsModule,
    UploadsModule,
    InvestmentsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
