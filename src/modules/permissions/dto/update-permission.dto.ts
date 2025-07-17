import { IsEnum, IsOptional } from 'class-validator';
import { PERMISSION_TYPE } from '../entities/permission.entity';

export class UpdatePermissionDto {
    @IsEnum(PERMISSION_TYPE)
    @IsOptional()
    name?: PERMISSION_TYPE;

    @IsOptional()
    description?: string;
} 