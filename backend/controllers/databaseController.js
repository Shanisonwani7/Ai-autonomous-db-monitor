const prisma = require("../config/prisma");

exports.addDatabase = async (req, res) => {
  try {
    const { name, dbType, host, port, username, password } = req.body;

    const database = await prisma.database.create({
      data: {
        name,
        dbType,
        host,
        port: Number(port),
        username,
        password,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      message: "Database Added Successfully",
      database,
    });
  } catch (err) {
    console.error("DATABASE ERROR:", err);

    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

exports.getDatabases = async (req, res) => {
  try {
    const databases = await prisma.database.findMany({
      where: {
        userId: req.user.id,
      },
    });

    res.json(databases);
  } catch (err) {
    console.error("DATABASE ERROR:", err);

    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};