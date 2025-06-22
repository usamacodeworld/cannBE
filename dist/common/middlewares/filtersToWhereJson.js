"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filtersToWhereJson = void 0;
const filtersToWhereJson = (req, _, next) => {
    console.log(req.query);
    console.log(req.query.filters);
    if (req?.query?.filters) {
        req.query.whereJson = req.query.filters;
        delete req.query.filters;
    }
    if (req?.query?.filter) {
        req.query.whereJson = req.query.filter;
        delete req.query.filter;
    }
    next();
};
exports.filtersToWhereJson = filtersToWhereJson;
