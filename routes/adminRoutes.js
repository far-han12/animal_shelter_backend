const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Import Controllers
const { getAdminPets, createPetAdmin, updatePetAdmin, deletePetAdmin } = require('../controllers/petController');
const { getInquiries, updateInquiryStatus } = require('../controllers/inquiryController');
const { getAdoptions, updateAdoptionStatus } = require('../controllers/adoptionController');
const { getVolunteers, updateVolunteerStatus } = require('../controllers/volunteerController');
const { createStory, updateStory, deleteStory, getStories } = require('../controllers/storyController');
const { createEvent, updateEvent, deleteEvent, getEvents } = require('../controllers/eventController');
const { getDonations } = require('../controllers/donationController');


const Donation = require('../models/donationModel');
const Pet = require('../models/petModel');
const AdoptionInquiry = require('../models/adoptionInquiryModel');
const AdoptionApplication = require('../models/adoptionApplicationModel');
const VolunteerApplication = require('../models/volunteerApplicationModel');
const Event = require('../models/eventModel');

router.use(protect);
router.use(admin);

// Analytics Endpoint
router.get('/analytics', async (req, res) => {
    // Totals
    const totalDonationAllTime = await Donation.aggregate([
        { $match: { 'ssl.status': 'VALID' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const startOfMonth = new Date(new Date().setDate(1));
    const totalDonationThisMonth = await Donation.aggregate([
        { $match: { 'ssl.status': 'VALID', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalPets = await Pet.countDocuments({ isDeleted: false });
    const petsByStatus = await Pet.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const newInquiries = await AdoptionInquiry.countDocuments({ status: 'NEW' });
    const contactedInquiries = await AdoptionInquiry.countDocuments({ status: 'CONTACTED' });
    const closedInquiries = await AdoptionInquiry.countDocuments({ status: 'CLOSED' });

    const pendingAdoptions = await AdoptionApplication.countDocuments({ status: 'PENDING' });
    const approvedAdoptions = await AdoptionApplication.countDocuments({ status: 'APPROVED' });
    const rejectedAdoptions = await AdoptionApplication.countDocuments({ status: 'REJECTED' });

    const pendingVolunteers = await VolunteerApplication.countDocuments({ status: 'PENDING' });

    const upcomingEvents = await Event.countDocuments({ startDateTime: { $gte: new Date() } });

    // Recent Activity (Last 5 of each)
    const recentPets = await Pet.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).select('name status createdAt');
    const recentAdoptions = await AdoptionApplication.find({}).sort({ createdAt: -1 }).limit(5).populate('userId', 'name').select('status createdAt');
    const recentDonations = await Donation.find({}).sort({ createdAt: -1 }).limit(5).select('donorName amount purpose createdAt');

    res.json({
        success: true,
        data: {
            donations: {
                allTime: totalDonationAllTime[0]?.total || 0,
                thisMonth: totalDonationThisMonth[0]?.total || 0
            },
            pets: {
                total: totalPets,
                breakdown: petsByStatus
            },
            inquiries: { new: newInquiries, contacted: contactedInquiries, closed: closedInquiries },
            adoptions: { pending: pendingAdoptions, approved: approvedAdoptions, rejected: rejectedAdoptions },
            volunteers: { pending: pendingVolunteers },
            events: { upcoming: upcomingEvents },
            recentActivity: {
                pets: recentPets,
                adoptions: recentAdoptions,
                donations: recentDonations
            }
        }
    });
});

// Pets Admin
router.route('/pets')
    .get(getAdminPets)
    .post(createPetAdmin);
router.route('/pets/:id')
    .patch(updatePetAdmin)
    .delete(deletePetAdmin);

// Inquiries Admin
router.route('/inquiries')
    .get(getInquiries);
router.route('/inquiries/:id')
    .patch(updateInquiryStatus);

// Adoptions Admin
router.route('/adoptions')
    .get(getAdoptions);
router.route('/adoptions/:id')
    .patch(updateAdoptionStatus);

// Volunteers Admin
router.route('/volunteers')
    .get(getVolunteers);
router.route('/volunteers/:id')
    .patch(updateVolunteerStatus);

// Stories Admin
router.route('/stories')
    .get(getStories)
    .post(createStory);
router.route('/stories/:id')
    .patch(updateStory)
    .delete(deleteStory);

// Events Admin
router.route('/events')
    .get(getEvents)
    .post(createEvent);
router.route('/events/:id')
    .patch(updateEvent)
    .delete(deleteEvent);

// Donations Admin
router.route('/donations')
    .get(getDonations);


module.exports = router;
