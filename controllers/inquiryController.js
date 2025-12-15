const asyncHandler = require('express-async-handler');
const AdoptionInquiry = require('../models/adoptionInquiryModel');

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Public
const createInquiry = asyncHandler(async (req, res) => {
    const { petId, name, email, phone, message } = req.body;

    const inquiry = await AdoptionInquiry.create({
        petId,
        name,
        email,
        phone,
        message
    });

    res.status(201).json({ success: true, data: inquiry });
});

// @desc    Get all inquiries (Admin)
// @route   GET /api/admin/inquiries
// @access  Private/Admin
const getInquiries = asyncHandler(async (req, res) => {
    const pages = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (pages - 1) * limit;

    const inquiries = await AdoptionInquiry.find({})
        .populate('petId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const count = await AdoptionInquiry.countDocuments({});

    res.json({
        success: true,
        data: inquiries,
        meta: {
            page: pages,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
});

// @desc    Update inquiry status (Admin)
// @route   PATCH /api/admin/inquiries/:id
// @access  Private/Admin
const updateInquiryStatus = asyncHandler(async (req, res) => {
    const inquiry = await AdoptionInquiry.findById(req.params.id);

    if (inquiry) {
        inquiry.status = req.body.status || inquiry.status;
        const updatedInquiry = await inquiry.save();
        res.json({ success: true, data: updatedInquiry });
    } else {
        res.status(404);
        throw new Error('Inquiry not found');
    }
});

module.exports = {
    createInquiry,
    getInquiries,
    updateInquiryStatus
};
