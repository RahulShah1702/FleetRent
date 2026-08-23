const express = require("express");

const {
    protect,
    businessOnly,
    driverOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/protected", protect, (req, res) => {
    res.json({
        message: "You are authenticated",
        userType: req.userType,
        user: req.user
    });
});

router.get(
    "/business",
    protect,
    businessOnly,
    (req, res) => {
        res.json({
            message: "Business access successful",
            business: req.user
        });
    }
);

router.get(
    "/driver",
    protect,
    driverOnly,
    (req, res) => {
        res.json({
            message: "Driver access successful",
            driver: req.user
        });
    }
);

module.exports = router;