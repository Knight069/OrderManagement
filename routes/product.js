const express = require("express");
const { Product } = require("../db");
const { adminMiddleware } = require("../middleware");


const router = express.Router();
router.post("/add", adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const product = new Product({ name, description, price, stock });
    await product.save();

    res.status(201).json({ message: "Product created successfully.", product });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
});

// Update Product
router.put("/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product)
      return res.status(404).json({ message: "Product not found." });

    res.status(200).json({ message: "Product updated successfully.", product });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
});

// Get All Products
router.get("/", async (req, res) => {
  try {
    const { minPrice, maxPrice, inStock, search } = req.query;
    const filter = { isDeleted: false };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (inStock) filter.stock = { $gt: 0 };
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
});

// Soft Delete Product
router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!product)
      return res.status(404).json({ message: "Product not found." });

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
});


module.exports = router;