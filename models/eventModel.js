const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date },
    images: [{ type: String }]
}, {
    timestamps: true,
});


const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
