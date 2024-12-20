const cron = require("node-cron");
const nodemailer = require("nodemailer");
const { Product, Order } = require("./db");

// Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Replace with your email service
  auth: {
    user: "admin@gmail.com", // Replace with your admin email
    pass: "yourpassword", // Replace with your email password or app password
  },
});

// 1. Product Stock Monitoring Cron
cron.schedule("0 0 * * *", async () => {
  try {
    const lowStockProducts = await Product.find({
      stock: { $lt: 10 },
      isDeleted: false,
    });

    if (lowStockProducts.length > 0) {
      const productNames = lowStockProducts.map((p) => p.name).join(", ");
      const message = `The following products have low stock: ${productNames}`;

      // Send email notification
      await transporter.sendMail({
        from: "admin@gmail.com",
        to: "admin@gmail.com", // Replace with the admin's email
        subject: "Low Stock Alert",
        text: message,
      });

      console.log("Low stock notification sent successfully.");
    }
  } catch (error) {
    console.error("Error in stock monitoring cron:", error.message);
  }
});

// 2. Order Fulfillment Reminder Cron
cron.schedule("0 * * * *", async () => {
  try {
    const pendingOrders = await Order.find({
      status: "Pending",
      isDeleted: false,
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).populate("user");

    for (const order of pendingOrders) {
      const userEmail = order.user.email;
      const message = `Reminder: Your order with ID ${order._id} is still pending. Please complete it as soon as possible.`;

      // Send email reminder
      await transporter.sendMail({
        from: "admin@example.com",
        to: userEmail,
        subject: "Order Fulfillment Reminder",
        text: message,
      });

      console.log(`Order reminder sent to ${userEmail}`);
    }
  } catch (error) {
    console.error("Error in order reminder cron:", error.message);
  }
});
