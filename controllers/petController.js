const asyncHandler = require('express-async-handler');
const Pet = require('../models/petModel');

// @desc    Get all pets (Public - Only Available)
// @route   GET /api/pets
// @access  Public
const getPets = asyncHandler(async (req, res) => {
    const pages = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (pages - 1) * limit;

    // Build Filter Query
    const query = { status: 'AVAILABLE', isDeleted: false };

    if (req.query.q) {
        query.name = { $regex: req.query.q, $options: 'i' };
    }
    if (req.query.species) {
        query.species = req.query.species;
    }
    if (req.query.breed) {
        query.breed = { $regex: req.query.breed, $options: 'i' };
    }
    if (req.query.ageMin || req.query.ageMax) {
        query.age = {};
        if (req.query.ageMin) query.age.$gte = Number(req.query.ageMin);
        if (req.query.ageMax) query.age.$lte = Number(req.query.ageMax);
    }
    if (req.query.size) {
        query.size = req.query.size;
    }
    if (req.query.gender) {
        query.gender = req.query.gender;
    }

    // Sorting
    let sort = {};
    if (req.query.sortBy) {
        const sortDir = req.query.sortDir === 'desc' ? -1 : 1;
        sort[req.query.sortBy] = sortDir;
    } else {
        sort = { createdAt: -1 };
    }

    const pets = await Pet.find(query).sort(sort).skip(skip).limit(limit);
    const count = await Pet.countDocuments(query);

    res.json({
        success: true,
        data: pets,
        meta: {
            page: pages,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
        },
    });
});

// @desc    Get single pet
// @route   GET /api/pets/:id
// @access  Public
const getPetById = asyncHandler(async (req, res) => {
    const pet = await Pet.findOne({ _id: req.params.id, isDeleted: false });

    if (pet) {
        res.json({ success: true, data: pet });
    } else {
        res.status(404);
        throw new Error('Pet not found');
    }
});

// @desc    Submit a pet (User)
// @route   POST /api/pets/submit
// @access  Private
const submitPet = asyncHandler(async (req, res) => {
    const {
        name,
        species,
        breed,
        age,
        size,
        gender,
        description,
        medicalNotes,
        specialNeeds,
        photos,
        ownerContact,
    } = req.body;

    const pet = await Pet.create({
        name,
        species,
        breed,
        age,
        size,
        gender,
        description,
        medicalNotes,
        specialNeeds,
        photos,
        status: 'PENDING_REVIEW',
        submittedByUserId: req.user._id,
        ownerContact,
    });

    res.status(201).json({ success: true, data: pet });
});

// @desc    Get user's submitted pets
// @route   GET /api/pets/my-submissions
// @access  Private
const getMyPets = asyncHandler(async (req, res) => {
    const pets = await Pet.find({ submittedByUserId: req.user._id, isDeleted: false })
        .sort({ createdAt: -1 });

    res.json({ success: true, data: pets });
});

// @desc    Update user's submitted pet
// @route   PATCH /api/pets/my-submissions/:id
// @access  Private
const updateMyPet = asyncHandler(async (req, res) => {
    const pet = await Pet.findOne({ _id: req.params.id, submittedByUserId: req.user._id, isDeleted: false });

    if (!pet) {
        res.status(404);
        throw new Error('Pet not found or not authorized');
    }

    if (pet.status !== 'PENDING_REVIEW' && pet.status !== 'REJECTED') {
        res.status(400);
        throw new Error('Cannot edit pet in current status');
    }

    // Update fields
    const { name, species, breed, age, size, gender, description, medicalNotes, specialNeeds, photos, ownerContact } = req.body;

    pet.name = name || pet.name;
    pet.species = species || pet.species;
    pet.breed = breed || pet.breed;
    pet.age = age || pet.age;
    pet.size = size || pet.size;
    pet.gender = gender || pet.gender;
    pet.description = description || pet.description;
    pet.medicalNotes = medicalNotes || pet.medicalNotes;
    pet.specialNeeds = specialNeeds !== undefined ? specialNeeds : pet.specialNeeds;
    pet.photos = photos || pet.photos;
    pet.ownerContact = ownerContact || pet.ownerContact;

    // If resubmitting after rejection, set back to pending
    if (pet.status === 'REJECTED') {
        pet.status = 'PENDING_REVIEW';
    }

    const updatedPet = await pet.save();
    res.json({ success: true, data: updatedPet });
});

// @desc    Delete (withdraw) user's submitted pet
// @route   DELETE /api/pets/my-submissions/:id
// @access  Private
const deleteMyPet = asyncHandler(async (req, res) => {
    const pet = await Pet.findOne({ _id: req.params.id, submittedByUserId: req.user._id, isDeleted: false });

    if (!pet) {
        res.status(404);
        throw new Error('Pet not found');
    }

    if (pet.status !== 'PENDING_REVIEW') {
        res.status(400);
        throw new Error('Cannot delete processed submission');
    }

    pet.isDeleted = true;
    await pet.save();

    res.json({ success: true, message: 'Submission withdrawn' });
});


// ADMIN CONTROLLERS

// @desc    Get all pets (Admin - includes pending etc)
// @route   GET /api/admin/pets
// @access  Private/Admin
const getAdminPets = asyncHandler(async (req, res) => {
    const pages = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (pages - 1) * limit;

    const query = { isDeleted: false };
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { species: { $regex: req.query.search, $options: 'i' } },
            { breed: { $regex: req.query.search, $options: 'i' } },
        ];
    }

    const pets = await Pet.find(query)
        .populate('submittedByUserId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const count = await Pet.countDocuments(query);

    res.json({
        success: true,
        data: pets,
        meta: {
            page: pages,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
});

// @desc    Create pet (Admin)
// @route   POST /api/admin/pets
// @access  Private/Admin
const createPetAdmin = asyncHandler(async (req, res) => {
    const pet = await Pet.create({ ...req.body, status: 'AVAILABLE' }); // Admin created defaults to available
    res.status(201).json({ success: true, data: pet });
});

// @desc    Update pet (Admin)
// @route   PATCH /api/admin/pets/:id
// @access  Private/Admin
const updatePetAdmin = asyncHandler(async (req, res) => {
    const pet = await Pet.findById(req.params.id);

    if (pet) {
        Object.assign(pet, req.body);
        const updatedPet = await pet.save();
        res.json({ success: true, data: updatedPet });
    } else {
        res.status(404);
        throw new Error('Pet not found');
    }
});

// @desc    Delete pet (Admin - Soft delete)
// @route   DELETE /api/admin/pets/:id
// @access  Private/Admin
const deletePetAdmin = asyncHandler(async (req, res) => {
    const pet = await Pet.findById(req.params.id);

    if (pet) {
        pet.isDeleted = true;
        await pet.save();
        res.json({ success: true, message: 'Pet deleted' });
    } else {
        res.status(404);
        throw new Error('Pet not found');
    }
});

module.exports = {
    getPets,
    getPetById,
    submitPet,
    getMyPets,
    updateMyPet,
    deleteMyPet,
    getAdminPets,
    createPetAdmin,
    updatePetAdmin,
    deletePetAdmin
};
