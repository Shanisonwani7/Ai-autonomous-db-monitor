const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getDatabaseVersion,
} = require("../controllers/monitoringController");

router.get(
    "/version/:id",
    authMiddleware,
    getDatabaseVersion
);

module.exports = router;