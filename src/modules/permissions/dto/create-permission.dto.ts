import { IsEnum, IsOptional } from 'class-validator';
import { PERMISSION_TYPE } from '../entities/permission.entity';

export class CreatePermissionDto {
    @IsEnum(PERMISSION_TYPE)
    name: PERMISSION_TYPE;

    @IsOptional()
    description?: string;
} 