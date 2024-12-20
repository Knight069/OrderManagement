const express = require('express');
const cors = require("cors");
const rootRouter = require("./routes/index.js")
const app  = express()
const cronJobs = require("./cron");

app.use(cors());
app.use(express.json());

app.use("/api/orders", rootRouter);
app.use("/api/products", rootRouter);

console.log("Starting server")

app.listen(3000)
console.log("Server started at port 3000")