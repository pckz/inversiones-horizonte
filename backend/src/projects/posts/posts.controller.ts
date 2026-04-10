import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('posts')
export class PostsController {
  constructor(private posts: PostsService) {}

  @Get('project/:projectId')
  findByProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('published') published?: string,
  ) {
    return this.posts.findByProject(projectId, published === 'true');
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.posts.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin' as any)
  create(@Body() dto: CreatePostDto) {
    return this.posts.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin' as any)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePostDto) {
    return this.posts.update(id, dto);
  }

  @Post(':id/publish-email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin' as any)
  publishAndEmail(@Param('id', ParseUUIDPipe) id: string) {
    return this.posts.publishAndEmail(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin' as any)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.posts.delete(id);
  }
}
