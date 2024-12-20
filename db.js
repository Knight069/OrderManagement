const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

mongoose.connect(
  "mongodb+srv://admin:RitHSjBOuHqRFFnI@knight.33blvnl.mongodb.net/OrderManagement"
);

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const OrderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

// Extend Employee Schema with additional methods for superuser features
ProductSchema.statics.addProduct = async function (productData) {
  try {
    const product = new this(productData);
    await product.save();
    return product;
  } catch (error) {
    throw error;
  }
};

ProductSchema.statics.editProduct = async function (productId, updatedData) {
  try {
    const product = await this.findByIdAndUpdate(productId, updatedData, {
      new: true,
    });
    return product;
  } catch (error) {
    throw error;
  }
};

ProductSchema.statics.deleteProduct = async function (productId) {
  try {
    const product = await this.findByIdAndDelete(productId);
    return product;
  } catch (error) {
    throw error;
  }
};

ProductSchema.statics.getAllProduct = async function () {
    try{
        const productDetails = await Product.find().populate("product");
        return productDetails;
    } catch (error){
        throw error;
    }
};


const User = mongoose.model("User", UserSchema);
const Product = mongoose.model("Product", ProductSchema);
const Order = mongoose.model("Order", OrderSchema);


module.exports = { User, Product, Order };