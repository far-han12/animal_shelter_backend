const express = require('express');
const router = express.Router();
const {
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getUsers);

router.route('/me')
    .patch(protect, updateUserProfile);

router.route('/:id')
    .delete(protect, admin, deleteUser)
    .get(protect, admin, getUserById)
    .patch(protect, admin, updateUser);

module.exports = router;
