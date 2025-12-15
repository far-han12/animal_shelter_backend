const asyncHandler = require('express-async-handler');
const AdoptionApplication = require('../models/adoptionApplicationModel');
const Pet = require('../models/petModel');

// @desc    Apply for adoption (User)
// @route   POST /api/adoptions/apply
// @access  Private
const applyForAdoption = asyncHandler(async (req, res) => {
    const { petId, applicantInfo } = req.body;

    // Check if pet exists and is available
    const pet = await Pet.findById(petId);
    if (!pet || (pet.status !== 'AVAILABLE' && pet.status !== 'PENDING_ADOPTION')) {
        res.status(400);
        throw new Error('Pet not available for adoption');
    }

    const application = await AdoptionApplication.create({
        petId,
        userId: req.user._id,
        applicantInfo
    });

    res.status(201).json({ success: true, data: application });
});

// @desc    Get my applications
// @route   GET /api/adoptions/my
// @access  Private
const getMyAdoptions = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const query = { userId: req.user._id };

    if (status) {
        query.status = status;
    }

    const applications = await AdoptionApplication.find(query)
        .populate('petId', 'name photos status')
        .sort({ createdAt: -1 });

    res.json({ success: true, data: applications });
});

// @desc    Get all applications (Admin)
// @route   GET /api/admin/adoptions
// @access  Private/Admin
const getAdoptions = asyncHandler(async (req, res) => {
    const pages = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (pages - 1) * limit;

    const query = {};

    if (req.query.status) {
        query.status = req.query.status;
    }

    // Advanced cleaning might be needed for populate filtering, but basic query first:
    // Searching inside populated fields (user name, pet name) requires aggregation or 2-step find.
    // For simplicity/performance now, we'll try to populate then filter in memory if result set small,
    // OR primarily filter by fields on the doc. 
    // Wait, Mongoose doesn't support easy filtering on populated fields in `find`.
    // Let's implement basic filtering on status. For search, if requested, we might need a workaround or aggregation.
    // For now, let's implement status filtering which is most critical.

    // If search is needed, we'll do a look-up. Let's start with basic status filter + pagination.

    const applications = await AdoptionApplication.find(query)
        .populate('petId', 'name')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const count = await AdoptionApplication.countDocuments({});

    res.json({
        success: true,
        data: applications,
        meta: {
            page: pages,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
});

// @desc    Update application status (Admin)
// @route   PATCH /api/admin/adoptions/:id
// @access  Private/Admin
const updateAdoptionStatus = asyncHandler(async (req, res) => {
    const application = await AdoptionApplication.findById(req.params.id);

    if (!application) {
        res.status(404);
        throw new Error('Application not found');
    }

    const { status, adminNote } = req.body;

    application.status = status || application.status;
    application.adminNote = adminNote || application.adminNote;

    await application.save();

    // If approved, update pet status
    if (status === 'APPROVED') {
        const pet = await Pet.findById(application.petId);
        if (pet) {
            pet.status = 'PENDING_ADOPTION';
            await pet.save();
        }
    }

    res.json({ success: true, data: application });
});

module.exports = {
    applyForAdoption,
    getMyAdoptions,
    getAdoptions,
    updateAdoptionStatus
};
