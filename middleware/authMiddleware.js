const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
    // TEMPORARY BYPASS: Force Admin User
    req.user = {
        _id: '65743f01e12f6b12c4567890', // Dummy valid ObjectId
        name: 'Bypassed Admin',
        email: 'admin@temp.com',
        role: 'ADMIN',
        isDisabled: false
    };
    return next();

    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-passwordHash');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            // Check if user is disabled
            if (req.user.isDisabled) {
                res.status(403);
                throw new Error('User account is disabled');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { protect, admin };
