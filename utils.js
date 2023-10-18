import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const readJSON = (path) => require(path);

const URLFiltersGenerator = (filters) => {
  let urlFilters = "";

  for (const filter in filters) {
    if (!filters.hasOwnProperty(filter)) return;

    urlFilters += `&${filter}=${filters[filter]}`;
  }

  return urlFilters;
};

const PORT = process.env.PORT || 3000;

const BASE_DOMAIN = process.env.BASE_DOMAIN || `http://localhost:${PORT}`;

export { readJSON, URLFiltersGenerator, PORT, BASE_DOMAIN };
