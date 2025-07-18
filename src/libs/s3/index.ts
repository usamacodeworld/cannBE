import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  type HeadObjectOutput,
  type _Object,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { cuid } from "../cuid";
import type { Express } from "express";

// Validate environment variables before proceeding
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS credentials are missing from environment variables");
}

const awsConfig = {
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

console.log("AWS Config:", {
  accessKeyId: awsConfig.credentials.accessKeyId
    ? `${awsConfig.credentials.accessKeyId.substring(0, 10)}...`
    : "NOT SET",
  region: awsConfig.region,
  bucketName: process.env.AWS_BUCKET_NAME || "cannbe-files-v1",
});

const s3Client = new S3Client(awsConfig);
const bucketName = process.env.AWS_BUCKET_NAME || "cannbe-files-v1";

export interface S3UploadResult {
  key: string;
  url: string;
  bucket: string;
  size: number;
  mimetype: string;
}

export interface S3FileInfo {
  key: string;
  url: string;
  size: number;
  lastModified: Date;
  mimetype: string;
}

export class S3Service {
  private bucketName: string;
  private s3: S3Client;

  constructor(bucketName?: string) {
    this.bucketName =
      bucketName || process.env.AWS_BUCKET_NAME || "cannbe-files-v1";
    this.s3 = new S3Client(awsConfig);
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = "uploads",
    customFileName?: string
  ): Promise<S3UploadResult> {
    const fileExtension = file.originalname.split(".").pop();
    const fileName = customFileName || `${cuid()}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });

    try {
      await this.s3.send(command);

      return {
        key,
        url: `https://${this.bucketName}.s3.${awsConfig.region}.amazonaws.com/${key}`,
        bucket: this.bucketName,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      throw new Error(
        `Failed to upload file to S3: ${(error as Error).message}`
      );
    }
  }

  /**
   * Upload a base64 image to S3
   */
  async uploadBase64Image(
    base64Data: string,
    folder: string = "uploads",
    fileName?: string
  ): Promise<S3UploadResult> {
    try {
      const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");
      const buffer = Buffer.from(base64Image, "base64");

      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let mimetype = "image/jpeg";
      let extension = "jpg";

      if (matches && matches.length === 3) {
        mimetype = matches[1];
        extension = mimetype.split("/")[1];
      }

      const finalFileName = fileName || `${cuid()}.${extension}`;
      const key = `${folder}/${finalFileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        Metadata: {
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3.send(command);

      return {
        key,
        url: `https://${this.bucketName}.s3.${awsConfig.region}.amazonaws.com/${key}`,
        bucket: this.bucketName,
        size: buffer.length,
        mimetype,
      };
    } catch (error) {
      throw new Error(
        `Failed to upload base64 image to S3: ${(error as Error).message}`
      );
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3.send(command);
      return true;
    } catch (error) {
      throw new Error(
        `Failed to delete file from S3: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get file information from S3
   */
  async getFileInfo(key: string): Promise<S3FileInfo | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const result: HeadObjectOutput = await this.s3.send(command);

      return {
        key: key,
        url: `https://${this.bucketName}.s3.${awsConfig.region}.amazonaws.com/${key}`,
        size: result.ContentLength || 0,
        lastModified: result.LastModified || new Date(),
        mimetype: result.ContentType || "application/octet-stream",
      };
    } catch (error: any) {
      if (error.name === "NotFound") {
        return null;
      }
      throw new Error(`Failed to get file info from S3: ${error.message}`);
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(
    prefix: string = "",
    maxKeys: number = 100
  ): Promise<S3FileInfo[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const result = await this.s3.send(command);

      return (result.Contents || []).map((item: _Object) => ({
        key: item.Key || "",
        url: `https://${this.bucketName}.s3.${awsConfig.region}.amazonaws.com/${item.Key}`,
        size: item.Size || 0,
        lastModified: item.LastModified || new Date(),
        mimetype: "application/octet-stream",
      }));
    } catch (error) {
      throw new Error(
        `Failed to list files from S3: ${(error as Error).message}`
      );
    }
  }

  /**
   * Generate a presigned URL for file upload
   */
  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (error) {
      throw new Error(
        `Failed to generate presigned URL: ${(error as Error).message}`
      );
    }
  }

  /**
   * Generate a presigned URL for file download
   */
  async generatePresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (error) {
      throw new Error(
        `Failed to generate presigned download URL: ${(error as Error).message}`
      );
    }
  }
}

// Export a default instance
export const s3Service = new S3Service();
