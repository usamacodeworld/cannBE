import { Repository } from "typeorm";
import { MediaFile, USER_SCOPE } from "./media-file.entity";
import { S3Service } from "../../libs/s3";

interface PaginationOptions {
  page: number;
  limit: number;
  scope?: string;
}

export class MediaService {
  constructor(
    private mediaFileRepository: Repository<MediaFile>,
    private s3Service: S3Service
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    scope: USER_SCOPE = USER_SCOPE.ADMIN,
    isPublic: boolean = true,
    userId?: string
  ): Promise<MediaFile> {
    // Upload to S3
    const uploadResult = await this.s3Service.uploadFile(file, "categories");

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
    scope: USER_SCOPE = USER_SCOPE.ADMIN,
    isPublic: boolean = true,
    userId?: string
  ): Promise<MediaFile> {
    return this.uploadFile(file, scope, isPublic, userId);
  }

  // CRUD Operations
  async getAllMedia(
    options: PaginationOptions
  ): Promise<{
    data: MediaFile[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, scope } = options;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.mediaFileRepository.createQueryBuilder("mediaFile");

    if (scope) {
      queryBuilder.where("mediaFile.scope = :scope", { scope });
    }

    const [data, total] = await queryBuilder
      .orderBy("mediaFile.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async getMediaById(id: string): Promise<MediaFile | null> {
    return this.mediaFileRepository.findOne({
      where: { id },
    });
  }

  async updateMedia(
    id: string,
    updateData: Partial<MediaFile>
  ): Promise<MediaFile | null> {
    const mediaFile = await this.mediaFileRepository.findOne({
      where: { id },
    });

    if (!mediaFile) {
      return null;
    }

    // Update only allowed fields
    const allowedFields = ["fileName", "scope"];
    const filteredData: any = {};

    allowedFields.forEach((field) => {
      if (updateData[field as keyof MediaFile] !== undefined) {
        filteredData[field] = updateData[field as keyof MediaFile];
      }
    });

    await this.mediaFileRepository.update(id, filteredData);
    return this.mediaFileRepository.findOne({ where: { id } });
  }

  async deleteMedia(id: string): Promise<boolean> {
    const mediaFile = await this.mediaFileRepository.findOne({
      where: { id },
    });

    if (!mediaFile) {
      return false;
    }

    // Delete from S3 if URI exists
    if (mediaFile.uri) {
      try {
        await this.s3Service.deleteFile(mediaFile.uri);
      } catch (error) {
        console.error("Error deleting file from S3:", error);
      }
    }

    // Delete media file record (cascade will handle media_connect)
    await this.mediaFileRepository.delete(id);
    return true;
  }

  async deleteMediaFile(mediaFileId: string): Promise<void> {
    const mediaFile = await this.mediaFileRepository.findOne({
      where: { id: mediaFileId },
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
