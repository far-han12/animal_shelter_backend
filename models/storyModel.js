const mongoose = require('mongoose');

const storySchema = mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    body: { type: String, required: true },
    coverImage: { type: String },
    galleryImages: [{ type: String }],
    publishedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

const Story = mongoose.model('Story', storySchema);
module.exports = Story;
