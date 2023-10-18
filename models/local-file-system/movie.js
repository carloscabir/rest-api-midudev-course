import { randomUUID } from "node:crypto";
import { URLFiltersGenerator, readJSON, BASE_DOMAIN } from "../../utils.js";

const movies = readJSON("./movies.json");

export class MovieModel {
  static async getAll({ limit, offset, filters }) {
    const response = {
      next: "",
      previous: "",
      results: movies,
    };

    for (const filter in filters) {
      if (!filters.hasOwnProperty(filter)) return;

      const filterValue = filters[filter];

      response.results = response.results.filter((movie) => {
        const movieDataToFilter = movie[filter];
        let filteredMovie;

        if (!movieDataToFilter)
          return { message: `400: Filter "${filter}" no valid` };

        if (
          Array.isArray(movieDataToFilter) &&
          movieDataToFilter.some(
            (data) => data.toLowerCase() === filterValue.toLowerCase()
          )
        )
          filteredMovie = movie;

        if (
          typeof movieDataToFilter === "string" &&
          movieDataToFilter.toLowerCase() === filterValue.toLowerCase()
        )
          filteredMovie = movie;

        if (
          typeof movieDataToFilter === "number" &&
          movieDataToFilter === Number(filterValue)
        )
          filteredMovie = movie;

        if (!response.results[filteredMovie]) return filteredMovie;
      });
    }

    const actualOffset = parseInt(offset);
    const actualLimit = parseInt(limit);
    const filtersParametersUrl = URLFiltersGenerator(filters);

    const paginatedResponse = response.results.slice(
      actualOffset * actualLimit,
      (actualOffset + 1) * actualLimit
    );

    response.next =
      paginatedResponse.length < actualLimit
        ? null
        : `${BASE_DOMAIN}/movies?offset=${
            actualOffset + 1
          }&limit=${actualLimit}${filtersParametersUrl}`;

    response.previous =
      actualOffset >= 1
        ? `${BASE_DOMAIN}/movies?offset=${
            actualOffset - 1
          }&limit=${actualLimit}${filtersParametersUrl}`
        : null;

    response.results = paginatedResponse;

    return response;
  }

  static async getById({ id }) {
    const movie = movies.find((movie) => movie.id === id);
    if (movie) return movie;
  }

  static async create({ input }) {
    // Base de datos
    const newMovie = {
      id: randomUUID(),
      ...input,
    };

    movies.push(newMovie);
    return newMovie;
  }

  static async delete({ id }) {
    const movieIndex = movies.findIndex((movie) => movie.id === id);

    if (movieIndex === -1) return false;

    movies.splice(movieIndex, 1);
    return true;
  }

  static async update({ id, input }) {
    const movieIndex = movies.findIndex((movie) => movie.id === id);

    if (movieIndex === -1) return false;

    const updateMovie = {
      ...movies[movieIndex],
      ...input,
    };

    movies[movieIndex] = updateMovie;
    return movies[movieIndex];
  }
}
