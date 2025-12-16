const express = require('express');
const router = express.Router();
const {
    initDonation,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    getDonations, // Admin only, will be used/imported in admin routes or protected here
    getMyDonations,
    paymentIpn
} = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/init', initDonation);
router.post('/payment/success/:tranId', paymentSuccess);
router.post('/payment/fail/:tranId', paymentFail);
router.post('/payment/cancel/:tranId', paymentCancel);
router.post('/payment/ipn', paymentIpn);
router.get('/my', protect, getMyDonations);

module.exports = router;
