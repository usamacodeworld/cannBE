import {
  FindOptionsWhere,
  Like,
  MoreThan,
  LessThan,
  In,
  ObjectLiteral,
  Between,
} from "typeorm";
import { FilterField } from "./pagination.interface";

export function buildWhereClause<T extends ObjectLiteral>(
  filters: FilterField[]
): FindOptionsWhere<T> {
  const where: FindOptionsWhere<T> = {};

  for (const filter of filters) {
    const { field, operator = "eq", value } = filter;

    // Handle nested fields with dot notation
    const fieldPath = field.split(".");
    let currentLevel: any = where;

    for (let i = 0; i < fieldPath.length - 1; i++) {
      const pathPart = fieldPath[i];
      currentLevel[pathPart] = currentLevel[pathPart] || {};
      currentLevel = currentLevel[pathPart];
    }

    const lastField = fieldPath[fieldPath.length - 1];

    switch (operator) {
      case "like":
        currentLevel[lastField] = Like(`%${value}%`);
        break;
      case "gt":
        currentLevel[lastField] = MoreThan(value);
        break;
      case "lt":
        currentLevel[lastField] = LessThan(value);
        break;
      case "gte":
        currentLevel[lastField] = MoreThan(value);
        break;
      case "lte":
        currentLevel[lastField] = LessThan(value);
        break;
      case "in":
        currentLevel[lastField] = In(
          Array.isArray(value) ? value : value.split(",")
        );
        break;
      default: // eq
        currentLevel[lastField] = value;
    }
  }

  return where;
}
