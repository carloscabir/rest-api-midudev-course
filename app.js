const crypto = require("node:crypto");
const express = require("express");
const app = express();

const movies = require("./movies.json");
const { validateMovie, validatePartialMovie } = require("./schemas/movies");

const PORT = process.env.PORT || 3000;

const ACCEPTED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5500",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://127.0.0.1:4000",
];

const URLFiltersGenerator = (filters) => {
  let urlFilters = "";

  for (const filter in filters) {
    if (!filters.hasOwnProperty(filter)) return;

    urlFilters += `&${filter}=${filters[filter]}`;
  }

  return urlFilters;
};

app.use(express.json());
app.disable("x-powered-by");

app.get("/", (req, res) => {
  res.json({ api: "v1.0.0" });
});

// Middleware para hacer redireccion si es que no se provee offset o limite y agrega filtros si es que existen
app.use("/movies", (req, res, next) => {
  let { offset, limit, ...filters } = req.query;

  if (!offset || !limit) {
    const filtersParametersUrl = URLFiltersGenerator(filters);

    return res.redirect(`/movies?offset=0&limit=5${filtersParametersUrl}`);
  }

  next();
});

// Todos los recursos que sean MOVIES se indentifican con /movies
app.get("/movies", (req, res) => {
  const origin = req.header("origin");
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  const { offset, limit, ...filters } = req.query;
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

      // Negar todos los condicionales y asignar valor a filteredMovie
      // Verificar si el filtro que quiero aplicar es aplicable en mis recursos
      if (!movieDataToFilter)
        return res
          .status(400)
          .json({ message: `400: Filter "${filter}" no valid` });

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

  const PATH = req.path;
  const actualOffset = parseInt(offset);
  const actualLimit = parseInt(limit);
  const filtersParametersUrl = URLFiltersGenerator(filters);

  const paginatedResponse = response.results.slice(
    actualOffset * actualLimit,
    (actualOffset + 1) * actualLimit
  );

  response.next =
    paginatedResponse.length <= 1
      ? null
      : `${req.protocol}://${req.hostname}:${PORT}${PATH}?offset=${
          actualOffset + 1
        }&limit=${actualLimit}${filtersParametersUrl}`;

  response.previous =
    actualOffset >= 1
      ? `${req.protocol}://${req.hostname}:${PORT}${PATH}?offset=${
          actualOffset - 1
        }&limit=${actualLimit}${filtersParametersUrl}`
      : null;

  response.results = paginatedResponse;

  return res.status(200).json(response);
});

app.get("/movies/:id", (req, res) => {
  const { id } = req.params;

  const movie = movies.find((movie) => movie.id === id);
  if (movie) return res.json(movie);

  res.status(404).json({ message: "404: Movie not found" });
});

app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);

  if (result.error)
    return res.status(400).json({ error: JSON.parse(result.error.message) });

  // Base de datos
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
  };

  movies.push(newMovie);
  res.status(201).json(newMovie);
});

app.delete("/movies/:id", (req, res, next) => {
  const origin = req.header("origin");
  if (ACCEPTED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1)
    return res.status(404).json({ message: "Movie not found" });

  movies.splice(movieIndex, 1);
  return res.status(200).json({ message: `Movie ${id} deleted succesfully` });
});

app.patch("/movie/:id", (req, res) => {
  const result = validatePartialMovie(req.body);

  if (!result.success)
    return res.status(400).json({ error: JSON.parse(result.error.message) });

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex < -1)
    return res.status(404).json({ message: "Movie not found" });

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  movies[movieIndex] = updateMovie;
  res.status(200).json(movies[movieIndex]);
});

// CORS preFlight
// Una prepeticion para peticiones COMPLEJAS
// Peticiones basicas GET, HEAD, POST
// Peteciones complejas PUT, PATCH, DELETE

app.options("/movies/:id", (req, res) => {
  const origin = req.header("origin");
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  }
  return res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server listening runing at http://localhost:${PORT}`);
});
