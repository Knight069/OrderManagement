const express = require("express");
const userRouter = require("./user.js");
const productRouter = require("./product.js");
const orderRouter = require("./order.js");

const router = express.Router();

router.use("/user", userRouter);
router.use("/product", productRouter);
router.use("/order", orderRouter);


module.exports = router;