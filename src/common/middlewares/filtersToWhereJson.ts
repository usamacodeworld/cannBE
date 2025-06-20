import type { Request, Response, NextFunction } from "express";

export const filtersToWhereJson = (
  req: Request,
  _: Response,
  next: NextFunction
): void => {
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
