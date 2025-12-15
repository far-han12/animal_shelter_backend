const asyncHandler = require('express-async-handler');
const Story = require('../models/storyModel');
const slugify = require('slugify');

// @desc    Get stories
// @route   GET /api/stories
// @access  Public
const getStories = asyncHandler(async (req, res) => {
    const pages = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (pages - 1) * limit;

    const stories = await Story.find({})
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit);

    const count = await Story.countDocuments({});

    res.json({
        success: true,
        data: stories,
        meta: {
            page: pages,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
});

// @desc    Get story by slug
// @route   GET /api/stories/:slug
// @access  Public
const getStoryBySlug = asyncHandler(async (req, res) => {
    const story = await Story.findOne({ slug: req.params.slug });
    if (story) {
        res.json({ success: true, data: story });
    } else {
        res.status(404);
        throw new Error('Story not found');
    }
});

// @desc    Create story (Admin)
// @route   POST /api/admin/stories
// @access  Private/Admin
const createStory = asyncHandler(async (req, res) => {
    const { title, body, coverImage, galleryImages } = req.body;
    const slug = slugify(title, { lower: true, strict: true });

    const story = await Story.create({
        title,
        slug,
        body,
        coverImage,
        galleryImages
    });

    res.status(201).json({ success: true, data: story });
});

// @desc    Update story (Admin)
// @route   PATCH /api/admin/stories/:id
// @access  Private/Admin
const updateStory = asyncHandler(async (req, res) => {
    const story = await Story.findById(req.params.id);

    if (story) {
        story.title = req.body.title || story.title;
        if (req.body.title) {
            story.slug = slugify(req.body.title, { lower: true, strict: true });
        }
        story.body = req.body.body || story.body;
        story.coverImage = req.body.coverImage !== undefined ? req.body.coverImage : story.coverImage;
        story.galleryImages = req.body.galleryImages || story.galleryImages;

        const updatedStory = await story.save();
        res.json({ success: true, data: updatedStory });
    } else {
        res.status(404);
        throw new Error('Story not found');
    }
});

// @desc    Delete story (Admin)
// @route   DELETE /api/admin/stories/:id
// @access  Private/Admin
const deleteStory = asyncHandler(async (req, res) => {
    const story = await Story.findById(req.params.id);
    if (story) {
        await story.deleteOne();
        res.json({ success: true, message: 'Story deleted' });
    } else {
        res.status(404);
        throw new Error('Story not found');
    }
});

module.exports = {
    getStories,
    getStoryBySlug,
    createStory,
    updateStory,
    deleteStory
};
