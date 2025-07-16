export class CategoryRestrictionResponseDto {
  id: string;
  categoryId: string;
  states: string[]; // Array of 2-character state codes
  isRestricted: boolean;
  reason?: string;
  customMessage?: string;
  isActive: boolean;
  createdBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryStateValidationResponseDto {
  isAllowed: boolean;
  restrictedCategories: {
    categoryId: string;
    categoryName: string;
    state: string;
    reason?: string;
    customMessage?: string;
  }[];
  message?: string;
} 