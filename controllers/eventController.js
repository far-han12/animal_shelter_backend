const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');
const slugify = require('slugify');

// @desc    Get events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
    const pages = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (pages - 1) * limit;

    let query = {};
    if (req.query.filter === 'upcoming') {
        query.startDateTime = { $gte: new Date() };
    } else if (req.query.filter === 'past') {
        query.startDateTime = { $lt: new Date() };
    }

    const events = await Event.find(query)
        .sort({ startDateTime: 1 })
        .skip(skip)
        .limit(limit);

    const count = await Event.countDocuments(query);

    res.json({
        success: true,
        data: events,
        meta: {
            page: pages,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
});

// @desc    Get event by slug
// @route   GET /api/events/:slug
// @access  Public
const getEventBySlug = asyncHandler(async (req, res) => {
    const event = await Event.findOne({ slug: req.params.slug });
    if (event) {
        res.json({ success: true, data: event });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Create event (Admin)
// @route   POST /api/admin/events
// @access  Private/Admin
const createEvent = asyncHandler(async (req, res) => {
    const { title, description, location, startDateTime, endDateTime, images } = req.body;
    const slug = slugify(title, { lower: true, strict: true });

    const event = await Event.create({
        title,
        slug,
        description,
        location,
        startDateTime,
        endDateTime,
        images
    });

    res.status(201).json({ success: true, data: event });
});

// @desc    Update event (Admin)
// @route   PATCH /api/admin/events/:id
// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        event.title = req.body.title || event.title;
        if (req.body.title) {
            event.slug = slugify(req.body.title, { lower: true, strict: true });
        }
        event.description = req.body.description || event.description;
        event.location = req.body.location || event.location;
        event.startDateTime = req.body.startDateTime || event.startDateTime;
        event.endDateTime = req.body.endDateTime || event.endDateTime;
        event.images = req.body.images || event.images;

        const updatedEvent = await event.save();
        res.json({ success: true, data: updatedEvent });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Delete event (Admin)
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (event) {
        await event.deleteOne();
        res.json({ success: true, message: 'Event deleted' });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

module.exports = {
    getEvents,
    getEventBySlug,
    createEvent,
    updateEvent,
    deleteEvent
};
