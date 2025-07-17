import { Request, Response } from "express";
import { GuestMigrationService } from "../services/guest-migration.service";
import { CreateUserDto } from "../../user/dto/create-user.dto";
import { validateDto } from "../../../common/middlewares/validation.middleware";
import { getResponseAPI } from "../../../common/getResponseAPI";

export class GuestMigrationController {
  private guestMigrationService: GuestMigrationService;

  constructor() {
    this.guestMigrationService = new GuestMigrationService();
  }

  /**
   * Register a new user and migrate guest data
   */
  async registerAndMigrate(req: Request, res: Response): Promise<void> {
    try {
      const { guestId, ...userData } = req.body;

      if (!guestId) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_GUEST_ID",
            message: "Guest ID is required for migration"
          }
        });
        return;
      }

      // Check if guest has any data to migrate
      const guestData = await this.guestMigrationService.checkGuestData(guestId);
      
      if (!guestData.hasCartItems && !guestData.hasOrders) {
        res.status(400).json({
          success: false,
          error: {
            code: "NO_GUEST_DATA",
            message: "No guest data found to migrate"
          }
        });
        return;
      }

      const result = await this.guestMigrationService.registerAndMigrate(
        userData as CreateUserDto,
        guestId
      );

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          migrationSummary: result.migrationSummary
        }
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: "MIGRATION_FAILED",
          message: error.message
        }
      });
    }
  }

  /**
   * Check guest data before migration
   */
  async checkGuestData(req: Request, res: Response): Promise<void> {
    try {
      const { guestId } = req.params;

      if (!guestId) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_GUEST_ID",
            message: "Guest ID is required"
          }
        });
        return;
      }

      const guestData = await this.guestMigrationService.checkGuestData(guestId);
      const orderHistory = await this.guestMigrationService.getGuestOrderHistory(guestId);

      res.status(200).json({
        success: true,
        data: {
          guestData,
          orderHistory
        }
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: "CHECK_FAILED",
          message: error.message
        }
      });
    }
  }
} 