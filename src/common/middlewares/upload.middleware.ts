import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Middleware for single image upload with error handling (custom field)
export const uploadSingleImageField = (fieldName: string) => (req: Request, res: Response, next: NextFunction) => {
  upload.single(fieldName)(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            message: 'File size too large. Maximum size is 5MB',
            requestId: req.headers['x-request-id'] || 'unknown',
            data: null,
            code: 1
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            message: 'Too many files. Maximum allowed is 10',
            requestId: req.headers['x-request-id'] || 'unknown',
            data: null,
            code: 1
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            message: 'Unexpected file field',
            requestId: req.headers['x-request-id'] || 'unknown',
            data: null,
            code: 1
          });
        }
      }
      if (err.message === 'Only image files are allowed') {
        return res.status(400).json({
          message: err.message,
          requestId: req.headers['x-request-id'] || 'unknown',
          data: null,
          code: 1
        });
      }
    }
    next();
  });
};

// Middleware for multiple images upload (custom field)
export const uploadMultipleImagesField = (fieldName: string, maxCount = 10) => upload.array(fieldName, maxCount);

export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'No file uploaded. Please provide an image file',
      requestId: req.headers['x-request-id'] || 'unknown',
      data: null,
      code: 1
    });
  }
  next();
};

// Validation middleware to check if files were uploaded
export const validateFilesUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      message: 'No files uploaded. Please provide image files',
      requestId: req.headers['x-request-id'] || 'unknown',
      data: null,
      code: 1
    });
  }
  next();
};

export { upload }; 