import { URLFiltersGenerator } from "../utils.js";

export const moviesRedirectPaginationMiddleware = (req, res, next) => {
  let { offset, limit, ...filters } = req.query;

  if (!offset || !limit) {
    const filtersParametersUrl = URLFiltersGenerator(filters);

    return res.redirect(`/movies?offset=0&limit=5${filtersParametersUrl}`);
  }

  next();
};
