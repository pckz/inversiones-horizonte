import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreatePostDto {
  @IsUUID()
  projectId: string;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
