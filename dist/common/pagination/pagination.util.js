"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = paginate;
const filter_util_1 = require("./filter.util");
async function paginate(repository, options, filters = [], additionalOptions = {}) {
    const { page, limit } = options;
    const where = (0, filter_util_1.buildWhereClause)(filters);
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
