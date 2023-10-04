const z = require("zod")

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a string",
    required_error: "Movie title is requried"
  }),
  genre: z.array(
    z.enum(["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Trhiller", "Sci-Fi", "Romance"]),
    {
      invalid_type_error: "Movie genre must be and array of enum Genre",
      required_error: "Genre must be required"
    }
    ),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    message: "Poster must be an URL"
  })
})

function validateMovie(input) { 
  return movieSchema.safeParse(input)
}

function validatePartialMovie(input) { 
  return movieSchema.partial().safeParse(input)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}