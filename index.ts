import express from "express";
import cuisinesRouter from "./routes/cuisines.js"
import restaurantsRouter from "./routes/restaurants.js"
import { errorHandler } from "./middleware/errorHandler.js";
const app = express();

app.use(express.json());


app.use("/restaurants",restaurantsRouter)
app.use('/cuisines',cuisinesRouter)

app.use(errorHandler)
const PORT = process.env.PORT || 3000;

app
  .listen(PORT, () => console.log(`Application running on ${PORT}`))
  .on("error", (err) => {
    throw new Error(err.message);
  });
