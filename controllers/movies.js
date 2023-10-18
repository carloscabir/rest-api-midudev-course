import { MovieModel } from "../models/local-file-system/movie.js";
import { validateMovie, validatePartialMovie } from "../schemas/movies.js";

export class MovieController {
  static async getAll(req, res) {
    const { offset, limit, ...filters } = req.query;

    const movies = await MovieModel.getAll({ offset, limit, filters });
    if (!movies)
      return res.status(500).json({ message: "505: Internal Server Error" });

    res.status(200).json(movies);
  }

  static async getById(req, res) {
    const { id } = req.params;

    const movie = await MovieModel.getById({ id });

    if (!movie)
      return res.status(404).json({ message: "404: Movie not found" });

    res.status(200).json(movie);
  }

  static async create(req, res) {
    const result = validateMovie(req.body);
    if (result.error)
      return res.status(400).json({ error: JSON.parse(result.error.message) }); //422

    const newMovie = await MovieModel.create({ input: result.data });

    res.status(201).json(newMovie);
  }

  static async delete(req, res) {
    const { id } = req.params;

    const result = await MovieModel.delete({ id });

    if (!result) {
      return res.status(404).json({ message: "404: Movie not found" });
    }

    res.status(200).json({ message: `Movie ${id} deleted succesfully` });
  }

  static async uptade(req, res) {
    const result = validatePartialMovie(req.body);

    if (!result.success)
      return res.status(400).json({ error: JSON.parse(result.error.message) });

    const { id } = req.params;
    const updatedMovie = await MovieModel.update({ id, input: result.data });

    if (!updatedMovie)
      return res.status(404).json({ message: "404: Movie not found" });

    res.status(200).json(updatedMovie);
  }
}
