import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { MediaFile } from './media-file.entity';

export enum ENTITY_TYPE {
  CATEGORY = 'category',
  PRODUCT = 'product',
  USER = 'user'
}

@Entity({ name: 'media_connect' })
export class MediaConnect {
  @PrimaryColumn()
  entityType: ENTITY_TYPE;

  @PrimaryColumn()
  entityId: string;

  @PrimaryColumn()
  mediaFileId: string;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne(() => MediaFile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mediaFileId' })
  mediaFile: MediaFile;
} 