const express = require("express");

const {
    googleDriverLogin,
    googleBusinessLogin
} = require("../controllers/googleAuthController");

const router = express.Router();


// Driver Google Login
router.post(
    "/driver",
    googleDriverLogin
);


// Business Google Login
router.post(
    "/business",
    googleBusinessLogin
);


module.exports = router;