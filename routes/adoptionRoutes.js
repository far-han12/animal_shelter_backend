const express = require('express');
const router = express.Router();
const { applyForAdoption, getMyAdoptions } = require('../controllers/adoptionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/apply', protect, applyForAdoption);
router.get('/my', protect, getMyAdoptions);

module.exports = router;
