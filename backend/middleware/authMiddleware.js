const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("========== AUTH DEBUG ==========");
  console.log("Authorization Header:", authHeader);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  if (!authHeader) {
    return res.status(401).json({
      message: "Token required",
    });
  }

  const token = authHeader.split(" ")[1];

  console.log("Received Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded JWT:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT ERROR NAME:", err.name);
    console.log("JWT ERROR MESSAGE:", err.message);

    return res.status(401).json({
      message: "Invalid Token",
    });
  }
};