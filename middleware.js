const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");
const { User } = require("./db");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    req.user = user;
    req.email = decoded.email;
    req.role = decoded.role;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Unauthorized" });
  }
};

const adminMiddleware = async (req, res, next) => {
  if (req.email !== "admin@gmail.com") {
    return res.status(403).json({ message: "Unauthorized admin" });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
};
