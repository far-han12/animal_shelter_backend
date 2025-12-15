const express = require('express');
const router = express.Router();
const {
    initDonation,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    getDonations // Admin only, will be used/imported in admin routes or protected here
} = require('../controllers/donationController');

router.post('/init', initDonation);
router.post('/payment/success/:tranId', paymentSuccess);
router.post('/payment/fail/:tranId', paymentFail);
router.post('/payment/cancel/:tranId', paymentCancel);

module.exports = router;
