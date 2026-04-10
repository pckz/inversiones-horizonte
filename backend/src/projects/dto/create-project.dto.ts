import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNumber()
  @Min(0)
  targetAmount: number;

  @IsNumber()
  @Min(0)
  minInvestmentAmount: number;

  @IsOptional()
  @IsNumber()
  estimatedReturnPct?: number;

  @IsOptional()
  @IsNumber()
  estimatedReturnMinPct?: number;

  @IsOptional()
  @IsNumber()
  estimatedReturnMaxPct?: number;

  @IsOptional()
  @IsNumber()
  estimatedDurationMonths?: number;

  @IsOptional()
  @IsDateString()
  projectedEndDate?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  coverVideoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
