const jwt = require("jsonwebtoken");
const Driver = require("../models/Driver");
const Business = require("../models/Business");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized. Please login."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        let user;

        if (decoded.userType === "driver") {
            user = await Driver.findById(decoded.userId)
                .select("-password");
        } else if (decoded.userType === "business") {
            user = await Business.findById(decoded.userId)
                .select("-password");
        } else {
            return res.status(401).json({
                message: "Invalid user type"
            });
        }

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        req.user = user;
        req.userType = decoded.userType;

        next();

    } catch (error) {
        console.error(error);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};


const businessOnly = (req, res, next) => {
    if (req.userType !== "business") {
        return res.status(403).json({
            message: "Business access only"
        });
    }

    next();
};

const driverOnly = (req, res, next) => {
    if (req.userType !== "driver") {
        return res.status(403).json({
            message: "Driver access only"
        });
    }

    next();
};

module.exports = {
    protect,
    businessOnly,
    driverOnly
};