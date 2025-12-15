const mongoose = require('mongoose');

const volunteerApplicationSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    availability: { type: String, required: true },
    interests: [{ type: String }],
    notes: { type: String },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    adminNote: { type: String }
}, {
    timestamps: true,
});

const VolunteerApplication = mongoose.model('VolunteerApplication', volunteerApplicationSchema);
module.exports = VolunteerApplication;
