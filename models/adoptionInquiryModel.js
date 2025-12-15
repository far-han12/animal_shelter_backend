const mongoose = require('mongoose');

const adoptionInquirySchema = mongoose.Schema({
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['NEW', 'CONTACTED', 'CLOSED'],
        default: 'NEW'
    }
}, {
    timestamps: true,
});

const AdoptionInquiry = mongoose.model('AdoptionInquiry', adoptionInquirySchema);
module.exports = AdoptionInquiry;
