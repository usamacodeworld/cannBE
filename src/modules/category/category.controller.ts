import { Request, Response } from "express";
import { Repository } from "typeorm";
import { Category } from "./category.entity";
import { CategoryService } from "./category.service";

import { GetCategoriesQueryDto } from "./dto/get-categories-query.dto";
import { GetCategoriesUnrestrictedQueryDto } from "./dto/get-categories-unrestricted-query.dto";
import slugify from "slug";
import { cuid } from "../../libs/cuid";

export function categoryController(categoryRepository: Repository<Category>) {
  const categoryService = new CategoryService(categoryRepository);

  return {
    createCategory: async (req: Request, res: Response) => {
      console.log("Data ===> ", req.body);
      try {
        const categoryData = req.body;

        if (!categoryData.slug) {
          categoryData.slug = slugify(categoryData.name, { lower: true });
        }

        // Get userId from authenticated user
        const userId = (req as any).user?.id;

        const category = await categoryService.create(categoryData, userId);
        res.status(201).json({
          message: "Category created successfully",
          requestId: cuid(),
          data: category,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(400).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getCategories: async (req: Request, res: Response) => {
      try {
        const query = req.query as unknown as GetCategoriesQueryDto;
        const categories = await categoryService.findAll(query);
        res.json({
          message: "Categories retrieved successfully",
          requestId: cuid(),
          data: categories,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getCategoriesUnrestricted: async (req: Request, res: Response) => {
      try {
        const query = req.query as unknown as GetCategoriesUnrestrictedQueryDto;
        const categories = await categoryService.findAllWithParents(query);
        
        res.json({
          message: "Categories retrieved successfully",
          requestId: cuid(),
          data: categories,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getCategory: async (req: Request, res: Response) => {
      try {
        const category = await categoryService.findOne(req.params.id);
        res.json({
          message: "Category retrieved successfully",
          requestId: cuid(),
          data: category,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(404).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getCategoryBySlug: async (req: Request, res: Response) => {
      try {
        const category = await categoryService.findBySlug(req.params.slug);
        res.json({
          message: "Category retrieved successfully",
          requestId: cuid(),
          data: category,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(404).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    updateCategory: async (req: Request, res: Response) => {
      try {
        // Get userId from authenticated user
        const userId = (req as any).user?.id;

        const category = await categoryService.update(
          req.params.id,
          req.body,
          userId
        );
        res.json({
          message: "Category updated successfully",
          requestId: cuid(),
          data: category,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(400).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    deleteCategory: async (req: Request, res: Response) => {
      try {
        await categoryService.remove(req.params.id);
        res.status(200).json({
          message: "Category deleted successfully",
          requestId: cuid(),
          data: null,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(404).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getParentCategories: async (req: Request, res: Response) => {
      try {
        const query = req.query as unknown as GetCategoriesQueryDto;
        const categories = await categoryService.findParentCategories(query);
        res.json({
          message: "Parent categories retrieved successfully",
          requestId: cuid(),
          data: categories,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getSubCategories: async (req: Request, res: Response) => {
      try {
        const query = req.query as unknown as GetCategoriesQueryDto;
        const categories = await categoryService.findSubCategories(
          req.params.id,
          query
        );
        res.json({
          message: "Sub categories retrieved successfully",
          requestId: cuid(),
          data: categories,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(404).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },
  };
}
