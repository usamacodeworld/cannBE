import { BaseDto } from '../../../common/dto/base.dto';
import { USER_SCOPE } from '../media-file.entity';

export class MediaFileResponseDto implements BaseDto {
  id: string;
  scope: USER_SCOPE;
  uri?: string;
  url?: string;
  fileName: string;
  mimetype: string;
  size: number;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
} 