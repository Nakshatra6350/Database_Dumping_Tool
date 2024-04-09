const express = require("express");
const {
  serverController,
  linkController,
} = require("../controllers/serverController");
const router = express.Router();
router.get("/:server", serverController);
router.get("/:serverType/:link(*)", linkController);
module.exports = router;
