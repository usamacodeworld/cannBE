import AWS from "aws-sdk";
import { cuid } from "../cuid";

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
};

console.log("AWS Config:", {
  accessKeyId: awsConfig.accessKeyId
    ? `${awsConfig.accessKeyId.substring(0, 10)}...`
    : "NOT SET",
  region: awsConfig.region,
  bucketName: process.env.AWS_BUCKET_NAME || "cannbe-files-v1",
});

AWS.config.update(awsConfig);

const s3 = new AWS.S3();
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
  private s3Instance: AWS.S3;

  constructor(bucketName?: string) {
    this.bucketName =
      bucketName || process.env.AWS_BUCKET_NAME || "cannbe-files-v1";

    // Create a new S3 instance with explicit credentials
    this.s3Instance = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || "us-east-1",
    });
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = "uploads",
    customFileName?: string
  ): Promise<S3UploadResult> {
    try {
      const fileExtension = file.originalname.split(".").pop();
      const fileName = customFileName || `${cuid()}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      };

      const result = await this.s3Instance.upload(uploadParams).promise();

      return {
        key: result.Key,
        url: result.Location,
        bucket: result.Bucket,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error}`);
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

      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        Metadata: {
          uploadedAt: new Date().toISOString(),
        },
      };

      const result = await this.s3Instance.upload(uploadParams).promise();

      return {
        key: result.Key,
        url: result.Location,
        bucket: result.Bucket,
        size: buffer.length,
        mimetype: mimetype,
      };
    } catch (error) {
      throw new Error(`Failed to upload base64 image to S3: ${error}`);
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: key,
      };

      await this.s3Instance.deleteObject(deleteParams).promise();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error}`);
    }
  }

  /**
   * Get file information from S3
   */
  async getFileInfo(key: string): Promise<S3FileInfo | null> {
    try {
      const headParams = {
        Bucket: this.bucketName,
        Key: key,
      };

      const result = await this.s3Instance.headObject(headParams).promise();

      return {
        key: key,
        url: `https://${this.bucketName}.s3.amazonaws.com/${key}`,
        size: result.ContentLength || 0,
        lastModified: result.LastModified || new Date(),
        mimetype: result.ContentType || "application/octet-stream",
      };
    } catch (error) {
      if ((error as any).code === "NotFound") {
        return null;
      }
      throw new Error(`Failed to get file info from S3: ${error}`);
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
      const listParams = {
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      };

      const result = await this.s3Instance.listObjectsV2(listParams).promise();

      return (result.Contents || []).map((item) => ({
        key: item.Key || "",
        url: `https://${this.bucketName}.s3.amazonaws.com/${item.Key}`,
        size: item.Size || 0,
        lastModified: item.LastModified || new Date(),
        mimetype: "application/octet-stream", // S3 listObjects doesn't return ContentType
      }));
    } catch (error) {
      throw new Error(`Failed to list files from S3: ${error}`);
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
      const params = {
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        Expires: expiresIn,
      };

      return await this.s3Instance.getSignedUrlPromise("putObject", params);
    } catch (error) {
      throw new Error(`Failed to generate presigned URL: ${error}`);
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
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn,
      };

      return await this.s3Instance.getSignedUrlPromise("getObject", params);
    } catch (error) {
      throw new Error(`Failed to generate presigned download URL: ${error}`);
    }
  }
}

// Export a default instance
export const s3Service = new S3Service();
