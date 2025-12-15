const mongoose = require('mongoose');

const petSchema = mongoose.Schema({
    name: { type: String, required: true },
    species: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    size: { type: String, required: true }, // Small, Medium, Large
    gender: { type: String, required: true },
    description: { type: String, required: true },
    medicalNotes: { type: String },
    specialNeeds: { type: Boolean, default: false },
    photos: [{ type: String }], // Array of URLs
    status: {
        type: String,
        enum: ['PENDING_REVIEW', 'AVAILABLE', 'PENDING_ADOPTION', 'ADOPTED', 'REJECTED'],
        default: 'PENDING_REVIEW'
    },
    submittedByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null for admin
    },
    ownerContact: {
        name: String,
        phone: String,
        email: String
    },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
});

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
