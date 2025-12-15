const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Update user profile
// @route   PATCH /api/users/me
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;

        if (req.body.password) {
            user.passwordHash = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
            },
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const pages = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (pages - 1) * limit;

    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ],
        }
        : {};

    const filterObj = {
        ...keyword,
    };

    if (req.query.role) filterObj.role = req.query.role;
    if (req.query.isDisabled) filterObj.isDisabled = req.query.isDisabled === 'true';

    const users = await User.find(filterObj)
        .select('-passwordHash')
        .skip(skip)
        .limit(limit);

    const count = await User.countDocuments(filterObj);

    res.json({
        success: true,
        data: users,
        meta: {
            page: pages,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ success: true, message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (user) {
        res.json({ success: true, data: user });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user (Admin) - e.g. disable/enable, change role
// @route   PATCH /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;

        if (req.body.isDisabled !== undefined) {
            user.isDisabled = req.body.isDisabled;
        }

        const updatedUser = await user.save();

        res.json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isDisabled: updatedUser.isDisabled
            },
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
};
