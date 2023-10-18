import express, { json } from "express";
import { moviesRouter } from "./routes/movies.js";
import { corsMiddleware } from "./middlewares/cors.js";
import { BASE_DOMAIN, PORT } from "./utils.js";
const app = express();

app.use(json());
app.use(corsMiddleware());
app.disable("x-powered-by");

app.get("/", (req, res) => {
  res.json({ api: "v1.0.0" });
});

app.use("/movies", moviesRouter);

app.listen(PORT, () => {
  console.log(`Server listening runing at ${BASE_DOMAIN}`);
});
