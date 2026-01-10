const express = require("express");
const { serverHealthCheck, databaseHealthCheck, redisHealthCheck } = require("../controllers/health-check-controller");
const router = express.Router();

// Public health endpoints
router.get("/server", serverHealthCheck);
router.get("/db", databaseHealthCheck);
router.get("/redis", redisHealthCheck);

module.exports = router;
