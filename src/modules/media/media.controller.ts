import { Request, Response } from "express";
import { MediaService } from "./media.service";
import { getResponseAPI } from "../../common/getResponseAPI";
import { MediaFile } from "./media-file.entity";
import { AppDataSource } from "../../config/database";
import { S3Service } from "../../libs/s3";

export class MediaController {
  private mediaService: MediaService;

  constructor() {
    const mediaFileRepository = AppDataSource.getRepository(MediaFile);
    const s3Service = new S3Service();
    this.mediaService = new MediaService(mediaFileRepository, s3Service);
  }

  // Upload a single media file
  async uploadMedia(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res
          .status(400)
          .json(getResponseAPI("400", { errors: "No file uploaded" }));
        return;
      }

      const userId = (req as any).user?.id; // Get user ID from auth middleware
      const mediaFile = await this.mediaService.uploadFile(
        req.file,
        undefined,
        true,
        userId
      );

      res.status(201).json(getResponseAPI("0", mediaFile));
    } catch (error) {
      console.error("Error uploading media file:", error);
      res
        .status(500)
        .json(getResponseAPI("500", { errors: "Error uploading media file" }));
    }
  }

  // Get all media files with pagination
  async getAllMedia(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, scope } = req.query;
      const mediaFiles = await this.mediaService.getAllMedia({
        page: Number(page),
        limit: Number(limit),
        scope: scope as string,
      });

      res.status(200).json(getResponseAPI("0", mediaFiles));
    } catch (error) {
      console.error("Error getting media files:", error);
      res
        .status(500)
        .json(getResponseAPI("500", { errors: "Error getting media files" }));
    }
  }

  // Get a single media file by ID
  async getMediaById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const mediaFile = await this.mediaService.getMediaById(id);

      if (!mediaFile) {
        res
          .status(404)
          .json(getResponseAPI("404", { errors: "Media file not found" }));
        return;
      }

      res.status(200).json(getResponseAPI("0", mediaFile));
    } catch (error) {
      console.error("Error getting media file:", error);
      res
        .status(500)
        .json(getResponseAPI("500", { errors: "Error getting media file" }));
    }
  }

  // Update media file metadata
  async updateMedia(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const mediaFile = await this.mediaService.updateMedia(id, updateData);

      if (!mediaFile) {
        res
          .status(404)
          .json(getResponseAPI("404", { errors: "Media file not found" }));
        return;
      }

      res.status(200).json(getResponseAPI("0", mediaFile));
    } catch (error) {
      console.error("Error updating media file:", error);
      res
        .status(500)
        .json(getResponseAPI("500", { errors: "Error updating media file" }));
    }
  }

  // Delete a media file
  async deleteMedia(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.mediaService.deleteMedia(id);

      if (!result) {
        res
          .status(404)
          .json(getResponseAPI("404", { errors: "Media file not found" }));
        return;
      }

      res.status(200).json(getResponseAPI("0", undefined));
    } catch (error) {
      console.error("Error deleting media file:", error);
      res
        .status(500)
        .json(getResponseAPI("500", { errors: "Error deleting media file" }));
    }
  }
}
