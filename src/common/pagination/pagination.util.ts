import { Repository, FindManyOptions, ObjectLiteral } from "typeorm";
import {
  FilterField,
  PaginationOptions,
  PaginationResult,
} from "./pagination.interface";
import { buildWhereClause } from "./filter.util";

export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  options: PaginationOptions,
  filters: FilterField[] = [],
  additionalOptions: Omit<FindManyOptions<T>, "where"> = {}
): Promise<PaginationResult<T>> {
  const { page, limit } = options;

  const where = buildWhereClause<T>(filters);

  const [items, total] = await repository.findAndCount({
    ...additionalOptions,
    where,
    skip: (page - 1) * limit,
    take: limit,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    currentPage: page,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}
