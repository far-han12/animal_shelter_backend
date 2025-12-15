const asyncHandler = require('express-async-handler');
const VolunteerApplication = require('../models/volunteerApplicationModel');

// @desc    Apply to volunteer
// @route   POST /api/volunteers/apply
// @access  Public
const applyVolunteer = asyncHandler(async (req, res) => {
    const { name, email, phone, address, availability, interests, notes } = req.body;

    const application = await VolunteerApplication.create({
        name, email, phone, address, availability, interests, notes
    });

    res.status(201).json({ success: true, data: application });
});

// @desc    Get volunteers (Admin)
// @route   GET /api/admin/volunteers
// @access  Private/Admin
const getVolunteers = asyncHandler(async (req, res) => {
    const pages = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (pages - 1) * limit;

    const volunteers = await VolunteerApplication.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const count = await VolunteerApplication.countDocuments({});

    res.json({
        success: true,
        data: volunteers,
        meta: {
            page: pages,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
});

// @desc    Update volunteer status (Admin)
// @route   PATCH /api/admin/volunteers/:id
// @access  Private/Admin
const updateVolunteerStatus = asyncHandler(async (req, res) => {
    const volunteer = await VolunteerApplication.findById(req.params.id);

    if (volunteer) {
        volunteer.status = req.body.status || volunteer.status;
        volunteer.adminNote = req.body.adminNote || volunteer.adminNote;

        const updatedVolunteer = await volunteer.save();
        res.json({ success: true, data: updatedVolunteer });
    } else {
        res.status(404);
        throw new Error('Volunteer application not found');
    }
});

module.exports = {
    applyVolunteer,
    getVolunteers,
    updateVolunteerStatus
};
