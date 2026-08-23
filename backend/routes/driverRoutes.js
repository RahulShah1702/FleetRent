const express = require("express");
const {
    registerDriver,
    loginDriver,
    getDrivers
} = require("../controllers/driverController");
const {
    protect,
    businessOnly
} = require("../middleware/authMiddleware");

const {
    // existing functions...

    searchAvailableDrivers

} = require("../controllers/driverController");

const router = express.Router();

router.post("/register", registerDriver);

router.post("/login", loginDriver);

router.get(
    "/",
    protect,
    businessOnly,
    getDrivers
);

router.get(
    "/available/search",
    protect,
    businessOnly,
    searchAvailableDrivers
);


module.exports = router;