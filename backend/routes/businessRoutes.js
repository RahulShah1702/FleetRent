const express = require("express");

const {
    registerBusiness,
    loginBusiness
} = require("../controllers/businessController");

const router = express.Router();

router.post("/register", registerBusiness);

router.post("/login", loginBusiness);

module.exports = router;