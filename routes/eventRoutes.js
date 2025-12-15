const express = require('express');
const router = express.Router();
const { getEvents, getEventBySlug } = require('../controllers/eventController');

router.get('/', getEvents);
router.get('/:slug', getEventBySlug);

module.exports = router;
