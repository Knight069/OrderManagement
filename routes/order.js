const express = require("express");
const { Product, Order, User } = require("../db");
const { authMiddleware } = require("../middleware");
const router = express.Router();


// Create Order
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { products } = req.body;
    let totalPrice = 0;

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product || product.isDeleted)
        return res.status(404).json({ message: "Product not found." });
      if (product.stock < item.quantity)
        return res.status(400).json({ message: "Insufficient stock." });

      totalPrice += product.price * item.quantity;
    }

    const order = new Order({ user: req.user.id, products, totalPrice });
    await order.save();

    res.status(201).json({ message: "Order created successfully.", order });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
});

// Get All Orders for a User
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
      isDeleted: false,
    }).populate("products.product");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
});

// Update Order Status
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found." });

    res
      .status(200)
      .json({ message: "Order status updated successfully.", order });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
});

// Soft Delete Order
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found." });

    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
});


module.exports = router;
