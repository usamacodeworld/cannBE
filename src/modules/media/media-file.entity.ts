import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum USER_SCOPE {
  ADMIN = 'admin',
  SELLER = 'seller',
  BUYER = 'buyer'
}

@Entity({ name: 'media_files' })
export class MediaFile extends BaseEntity {
  @Column({ 
    comment: 'Resource scope e.g. admin, seller, buyer', 
    default: USER_SCOPE.ADMIN 
  })
  scope: USER_SCOPE;

  @Column({
    unique: true,
    nullable: true,
    comment: 'File path in S3 bucket for internal files. The URL should be composed on retrieval using a pre-signed URL.',
  })
  uri?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'File URL for public media files (products, blog posts)',
  })
  url?: string;

  @Column()
  fileName: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  userId?: string;
} 