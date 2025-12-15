const express = require('express');
const router = express.Router();
const { applyVolunteer } = require('../controllers/volunteerController');

router.post('/apply', applyVolunteer);

module.exports = router;
