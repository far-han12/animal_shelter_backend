const mongoose = require('mongoose');

const adoptionApplicationSchema = mongoose.Schema({
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicantInfo: {
        address: { type: String, required: true },
        experience: { type: String, required: true },
        householdInfo: { type: String, required: true }, // e.g., "2 adults, 1 child"
        notes: { type: String },
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    adminNote: { type: String }
}, {
    timestamps: true,
});

const AdoptionApplication = mongoose.model('AdoptionApplication', adoptionApplicationSchema);
module.exports = AdoptionApplication;
