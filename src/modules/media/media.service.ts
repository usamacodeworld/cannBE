import { Repository } from 'typeorm';
import { MediaFile, USER_SCOPE } from './entities/media-file.entity';
import { MediaConnect, ENTITY_TYPE } from './entities/media-connect.entity';
import { S3Service } from '../../libs/s3';
import { cuid } from '../../libs/cuid';

interface PaginationOptions {
  page: number;
  limit: number;
  scope?: string;
}

export class MediaService {
  constructor(
    private mediaFileRepository: Repository<MediaFile>,
    private mediaConnectRepository: Repository<MediaConnect>,
    private s3Service: S3Service,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    scope: USER_SCOPE = USER_SCOPE.MARKETPLACE,
    isPublic: boolean = true,
    userId?: string
  ): Promise<MediaFile> {
    // Upload to S3
    const uploadResult = await this.s3Service.uploadFile(file, 'categories');
    
    // Create media file record
    const mediaFile = this.mediaFileRepository.create({
      scope,
      fileName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uri: isPublic ? undefined : uploadResult.key,
      url: isPublic ? uploadResult.url : undefined,
      userId,
    });

    return this.mediaFileRepository.save(mediaFile);
  }

  async uploadSingleFile(
    file: Express.Multer.File,
    scope: USER_SCOPE = USER_SCOPE.MARKETPLACE,
    isPublic: boolean = true,
    userId?: string
  ): Promise<MediaFile> {
    return this.uploadFile(file, scope, isPublic, userId);
  }

  // CRUD Operations
  async getAllMedia(options: PaginationOptions): Promise<{ data: MediaFile[]; total: number; page: number; limit: number }> {
    const { page, limit, scope } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.mediaFileRepository.createQueryBuilder('mediaFile');

    if (scope) {
      queryBuilder.where('mediaFile.scope = :scope', { scope });
    }

    const [data, total] = await queryBuilder
      .orderBy('mediaFile.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async getMediaById(id: string): Promise<MediaFile | null> {
    return this.mediaFileRepository.findOne({
      where: { id }
    });
  }

  async updateMedia(id: string, updateData: Partial<MediaFile>): Promise<MediaFile | null> {
    const mediaFile = await this.mediaFileRepository.findOne({
      where: { id }
    });

    if (!mediaFile) {
      return null;
    }

    // Update only allowed fields
    const allowedFields = ['fileName', 'scope'];
    const filteredData: any = {};
    
    allowedFields.forEach(field => {
      if (updateData[field as keyof MediaFile] !== undefined) {
        filteredData[field] = updateData[field as keyof MediaFile];
      }
    });

    await this.mediaFileRepository.update(id, filteredData);
    return this.mediaFileRepository.findOne({ where: { id } });
  }

  async deleteMedia(id: string): Promise<boolean> {
    const mediaFile = await this.mediaFileRepository.findOne({
      where: { id }
    });

    if (!mediaFile) {
      return false;
    }

    // Delete from S3 if URI exists
    if (mediaFile.uri) {
      try {
        await this.s3Service.deleteFile(mediaFile.uri);
      } catch (error) {
        console.error('Error deleting file from S3:', error);
      }
    }

    // Delete media file record (cascade will handle media_connect)
    await this.mediaFileRepository.delete(id);
    return true;
  }

  async getMediaByEntity(entityType: string, entityId: string): Promise<MediaFile[]> {
    const mediaConnections = await this.mediaConnectRepository.find({
      where: { entityType: entityType as ENTITY_TYPE, entityId },
      relations: ['mediaFile'],
      order: { sortOrder: 'ASC' },
    });

    return mediaConnections.map(connection => connection.mediaFile);
  }

  async connectMediaToEntity(
    mediaFileId: string,
    entityType: ENTITY_TYPE,
    entityId: string,
    sortOrder: number = 0
  ): Promise<MediaConnect> {
    const mediaConnect = this.mediaConnectRepository.create({
      mediaFileId,
      entityType,
      entityId,
      sortOrder,
    });

    return this.mediaConnectRepository.save(mediaConnect);
  }

  async connectSingleMediaToEntity(
    mediaFileId: string,
    entityType: ENTITY_TYPE,
    entityId: string
  ): Promise<MediaConnect> {
    return this.connectMediaToEntity(mediaFileId, entityType, entityId, 0);
  }

  async getEntityMedia(
    entityType: ENTITY_TYPE,
    entityId: string
  ): Promise<MediaFile[]> {
    const mediaConnections = await this.mediaConnectRepository.find({
      where: { entityType, entityId },
      relations: ['mediaFile'],
      order: { sortOrder: 'ASC' },
    });

    return mediaConnections.map(connection => connection.mediaFile);
  }

  async getEntitySingleMedia(
    entityType: ENTITY_TYPE,
    entityId: string
  ): Promise<MediaFile | null> {
    const mediaConnections = await this.mediaConnectRepository.find({
      where: { entityType, entityId },
      relations: ['mediaFile'],
      order: { sortOrder: 'ASC' },
      take: 1,
    });

    return mediaConnections.length > 0 ? mediaConnections[0].mediaFile : null;
  }

  async updateEntityMediaOrder(
    entityType: ENTITY_TYPE,
    entityId: string,
    mediaFileIds: string[]
  ): Promise<void> {
    // Delete existing connections
    await this.mediaConnectRepository.delete({ entityType, entityId });

    // Create new connections with updated order
    const connections = mediaFileIds.map((mediaFileId, index) => ({
      mediaFileId,
      entityType,
      entityId,
      sortOrder: index,
    }));

    await this.mediaConnectRepository.save(connections);
  }

  async deleteEntityMedia(
    entityType: ENTITY_TYPE,
    entityId: string,
    mediaFileId?: string
  ): Promise<void> {
    const whereCondition: any = { entityType, entityId };
    if (mediaFileId) {
      whereCondition.mediaFileId = mediaFileId;
    }

    await this.mediaConnectRepository.delete(whereCondition);
  }

  async deleteMediaFile(mediaFileId: string): Promise<void> {
    const mediaFile = await this.mediaFileRepository.findOne({
      where: { id: mediaFileId }
    });

    if (mediaFile) {
      // Delete from S3 if URI exists
      if (mediaFile.uri) {
        await this.s3Service.deleteFile(mediaFile.uri);
      }

      // Delete media file record (cascade will handle media_connect)
      await this.mediaFileRepository.delete(mediaFileId);
    }
  }
} 