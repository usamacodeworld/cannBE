import { Router } from "express";
import { MediaController } from "./media.controller";
import { upload } from "../../common/middlewares/upload.middleware";

const router = Router();
const mediaController = new MediaController();

// Upload a single media file
router.post(
  "/upload",
  upload.single("file"),
  mediaController.uploadMedia.bind(mediaController)
);

// Get all media files with pagination
router.get("/all", mediaController.getAllMedia.bind(mediaController));

// Get a single media file by ID
router.get("/:id", mediaController.getMediaById.bind(mediaController));

// Update media file metadata
router.put("/:id", mediaController.updateMedia.bind(mediaController));

// Delete a media file
router.delete("/:id", mediaController.deleteMedia.bind(mediaController));

export default router;
