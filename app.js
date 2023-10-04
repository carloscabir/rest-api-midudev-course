const crypto = require("node:crypto")
const express = require("express")
const app = express()

const movies = require("./movies.json")
const { validateMovie, validatePartialMovie } = require("./schemas/movies")

const PORT = process.env.PORT || 3000
const URL = process.env.URL || `http://localhost:${PORT}`
const ACCEPTED_ORIGINS = ["http://localhost:3000", "http://localhost:5500", "http://localhost:3000", "http://127.0.0.1:5500", "http://127.0.0.1:4000" ]

app.use(express.json())
app.disable("x-powered-by")

app.get("/", (req, res) => {
  res.json({api: "v1.0.0"})
})

// Todos los recursos que sean MOVIES se indentifican con /movies
app.get("/movies", (req, res) => {
  const origin = req.header("origin")
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) { 
  res.header("Access-Control-Allow-Origin", origin)
  }

  let { genre, offset, limit } = req.query;
  const url = req.url
  

  const response = {
    next: `${URL}/movies?offset=${Number(offset) + 1}&limit=${limit}`,
    previous: offset >= 1 ? `${URL}/movies?offset=${offset - 1}&limit=${limit}`: null,
    results : movies
  }
  
  if (!offset || !limit) {
      // Propiedades por defecto si no se dan estos parametros
      !offset ? offset = 0 : offset; 
      !limit ? limit = 5 : limit;
  
  // Auto definicion de offset y limit PENDIENTE (bug)
      res.redirect(`${url}offset=${offset}&limit=${limit}`)
  }
  
  if (genre) { 
    const filteredMovies = movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
   
    response.next = `${response.next}&genre=${genre}`
    response.previous ? response.previous = `${response.previous}&genre=${genre}` : null
    response.results = filteredMovies
  }

  const paginatedResponse = response.results.slice((offset * limit), ((Number(offset) + 1) * limit))
  return res.json(
    {
      ...response,
      results: paginatedResponse,
    } 
  )

})

app.get("/movies/:id", (req, res) => { 
  const { id } = req.params

  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)

  res.status(404).json({ message: "404: Movie not found"})

})


app.post("/movies", (req, res) => { 
  const result = validateMovie(req.body)

  if (result.error) return res.status(400).json({error: JSON.parse(result.error.message)})

  // Base de datos
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  movies.push(newMovie)
  res.status(201).json(newMovie)
})

app.delete("/movies/:id", (req, res, next) => {
  const origin = req.header("origin")
  if (ACCEPTED_ORIGINS.includes(origin)) { 
  res.header("Access-Control-Allow-Origin", origin)
 
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) return res.status(404).json({message: "Movie not found"})
  
  
  movies.splice(movieIndex, 1)
  return res.status(200).json({message: `Movie ${id} deleted succesfully`})
 })

app.patch("/movie/:id", (req, res) => {
  const result = validatePartialMovie(req.body)
  
  if (!result.success) return res.status(400).json({ error: JSON.parse(result.error.message) })
  
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex < -1) return res.status(404).json({ message: "Movie not found" })
  
  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie
  res.status(200).json(movies[movieIndex])
})
 
// CORS preFlight
// Una prepeticion para peticiones COMPLEJAS
// Peticiones basicas GET, HEAD, POST
// Peteciones complejas PUT, PATCH, DELETE

app.options("/movies/:id", (req, res) => {
  const origin = req.header("origin")
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) { 
    res.header("Access-Control-Allow-Origin", origin)
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE")
  }
  return res.sendStatus(200)
 })


app.listen(PORT, () => { 
  console.log(`Server listening at ${URL}`)
})
