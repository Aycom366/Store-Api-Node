require("dotenv").config();
//async errors
require("express-async-errors");

const express = require("express");
const app = express();

const connectDB = require("./db/connect");
const productRouter = require("./routes/products");

const notFoundMiddleWare = require("./middleware/not-found");
const errorMiddleware = require("./middleware/error-handler");

//middleware
app.use(express.json());

//routes
app.get("/", (req, res) => {
  res.send("<h2>Store API</h2><a href='/api/v1/products' >products route</a> ");
});

app.use("/api/v1/products", productRouter);

//products route

app.use(notFoundMiddleWare);
app.use(errorMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    //connectDb
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => console.log(`Listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
