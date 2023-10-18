import { Router } from "express";

import { moviesRedirectPaginationMiddleware } from "../middlewares/movies.js";
import { MovieController } from "../controllers/movies.js";

const moviesRouter = Router();

moviesRouter.get("/", moviesRedirectPaginationMiddleware);

moviesRouter.get("/", MovieController.getAll);

moviesRouter.get("/:id", MovieController.getById);

moviesRouter.post("/", MovieController.create);

moviesRouter.delete("/:id", MovieController.delete);

moviesRouter.patch("/:id", MovieController.uptade);

export { moviesRouter };
