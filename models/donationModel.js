const mongoose = require('mongoose');

const donationSchema = mongoose.Schema({
    donorName: { type: String },
    donorEmail: { type: String },
    donorPhone: { type: String },
    amount: { type: Number, required: true },
    purpose: { type: String, enum: ['GENERAL', 'SPONSOR_PET'], default: 'GENERAL' },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
    ssl: {
        tranId: { type: String, required: true },
        status: { type: String, required: true }, // PENDING, VALID, FAILED, CANCELLED
        valId: { type: String },
        sessionKey: { type: String }
    }
}, {
    timestamps: true,
});

const Donation = mongoose.model('Donation', donationSchema);
module.exports = Donation;
