const express = require('express');
const router = express.Router();
const {
    getPets,
    getPetById,
    submitPet,
    getMyPets,
    updateMyPet,
    deleteMyPet,
} = require('../controllers/petController');
const { protect } = require('../middleware/authMiddleware');

// Order matters!

// User Private Routes
router.post('/submit', protect, submitPet);
router.get('/my-submissions', protect, getMyPets);
router.patch('/my-submissions/:id', protect, updateMyPet);
router.delete('/my-submissions/:id', protect, deleteMyPet);

// Public Routes
router.get('/', getPets);
router.get('/:id', getPetById);

module.exports = router;
