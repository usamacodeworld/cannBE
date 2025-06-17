export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface FilterField {
  field: string;
  value: any;
  operator?: "eq" | "like" | "gt" | "lt" | "gte" | "lte" | "in";
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
