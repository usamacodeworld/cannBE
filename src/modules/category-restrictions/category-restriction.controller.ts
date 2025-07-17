import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { CategoryStateRestriction } from './category-restriction.entity';
import { CategoryRestrictionService } from './category-restriction.service';
import { CreateCategoryRestrictionDto } from './dto/create-category-restriction.dto';
import { UpdateCategoryRestrictionDto } from './dto/update-category-restriction.dto';
import { GetCategoryRestrictionsQueryDto } from './dto/get-category-restrictions-query.dto';
import { cuid } from '../../libs/cuid';

export function categoryRestrictionController(
  categoryRestrictionRepository: Repository<CategoryStateRestriction>
) {
  const categoryRestrictionService = new CategoryRestrictionService(categoryRestrictionRepository);

  return {
    // Create a new category restriction
    createRestriction: async (req: Request, res: Response) => {
      try {
        const createDto: CreateCategoryRestrictionDto = req.body;
        const userId = (req as any).user?.id;

        if (userId) {
          createDto.createdBy = userId;
        }

        const restriction = await categoryRestrictionService.create(createDto);
        res.status(201).json({
          message: 'Category restriction created successfully',
          requestId: cuid(),
          data: restriction,
          code: 0
        });
      } catch (error: unknown) {
        res.status(400).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Get all category restrictions
    getRestrictions: async (req: Request, res: Response) => {
      try {
        const query = req.query as unknown as GetCategoryRestrictionsQueryDto;
        const restrictions = await categoryRestrictionService.findAll(query);
        res.json({
          message: 'Category restrictions retrieved successfully',
          requestId: cuid(),
          data: restrictions,
          code: 0
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Get a specific category restriction by ID
    getRestriction: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const restriction = await categoryRestrictionService.findOne(id);
        res.json({
          message: 'Category restriction retrieved successfully',
          requestId: cuid(),
          data: restriction,
          code: 0
        });
      } catch (error: unknown) {
        res.status(404).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Update a category restriction
    updateRestriction: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const updateDto: UpdateCategoryRestrictionDto = req.body;
        const restriction = await categoryRestrictionService.update(id, updateDto);
        res.json({
          message: 'Category restriction updated successfully',
          requestId: cuid(),
          data: restriction,
          code: 0
        });
      } catch (error: unknown) {
        res.status(400).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Delete a category restriction
    deleteRestriction: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        await categoryRestrictionService.remove(id);
        res.json({
          message: 'Category restriction deleted successfully',
          requestId: cuid(),
          data: null,
          code: 0
        });
      } catch (error: unknown) {
        res.status(404).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Check if a category is restricted in a state
    checkRestriction: async (req: Request, res: Response) => {
      try {
        const { categoryId, state } = req.params;
        const result = await categoryRestrictionService.checkCategoryRestriction(categoryId, state);
        res.json({
          message: 'Category restriction checked successfully',
          requestId: cuid(),
          data: result,
          code: 0
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Validate products for a state
    validateProducts: async (req: Request, res: Response) => {
      try {
        const { state } = req.params;
        const { categoryIds } = req.body;
        
        if (!Array.isArray(categoryIds)) {
          res.status(400).json({
            message: 'categoryIds must be an array',
            requestId: cuid(),
            data: null,
            code: 1
          });
        } else {
          const result = await categoryRestrictionService.isProductRestrictedInState(categoryIds, state);
          res.json({
            message: 'Products validated successfully',
            requestId: cuid(),
            data: result,
            code: 0
          });
        }
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Get US states
    getUSStates: async (req: Request, res: Response) => {
      try {
        const states = categoryRestrictionService.getUSStates();
        res.json({
          message: 'US states retrieved successfully',
          requestId: cuid(),
          data: states,
          code: 0
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    }
  };
} 