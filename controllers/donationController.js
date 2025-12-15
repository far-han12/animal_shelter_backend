const asyncHandler = require('express-async-handler');
const SSLCommerzPayment = require('sslcommerz-lts');
const Donation = require('../models/donationModel');

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = process.env.IS_LIVE === 'true';

// @desc    Initialize Donation
// @route   POST /api/donations/init
// @access  Public
const initDonation = asyncHandler(async (req, res) => {
    const { amount, purpose, petId, donorName, donorEmail, donorPhone } = req.body;

    if (!amount) {
        res.status(400);
        throw new Error('Amount is required');
    }

    const tran_id = `DONATION-${Date.now()}`;

    const data = {
        total_amount: amount,
        currency: 'BDT',
        tran_id: tran_id, // Use unique tran_id for each api call
        success_url: `${process.env.BASE_URL}/api/donations/payment/success/${tran_id}`,
        fail_url: `${process.env.BASE_URL}/api/donations/payment/fail/${tran_id}`,
        cancel_url: `${process.env.BASE_URL}/api/donations/payment/cancel/${tran_id}`,
        ipn_url: `${process.env.BASE_URL}/api/donations/payment/ipn`,
        shipping_method: 'No',
        product_name: purpose === 'SPONSOR_PET' ? 'Pet Sponsorship' : 'General Donation',
        product_category: 'Donation',
        product_profile: 'general',
        cus_name: donorName || 'Anonymous',
        cus_email: donorEmail || 'no-email@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: donorPhone || '01711111111',
        cus_fax: '01711111111',
        ship_name: 'No',
        ship_add1: 'No',
        ship_add2: 'No',
        ship_city: 'No',
        ship_state: 'No',
        ship_postcode: 'No',
        ship_country: 'No',
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    // Save initial pending donation
    await Donation.create({
        donorName, donorEmail, donorPhone,
        amount, purpose, petId,
        ssl: { tranId: tran_id, status: 'PENDING' }
    });

    try {
        const apiResponse = await sslcz.init(data);
        if (apiResponse && apiResponse.GatewayPageURL) {
            res.json({ success: true, url: apiResponse.GatewayPageURL });
        } else {
            res.status(400);
            throw new Error('SSLCommerz Init Failed');
        }
    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error('Payment initialization error');
    }
});

// @desc    Payment Success
// @route   POST /api/donations/payment/success/:tranId
const paymentSuccess = asyncHandler(async (req, res) => {
    const { tranId } = req.params;
    const donation = await Donation.findOne({ 'ssl.tranId': tranId });

    if (donation) {
        donation.ssl.status = 'VALID';
        donation.ssl.valId = req.body.val_id;
        await donation.save();
    }

    res.redirect(`${process.env.BASE_URL.replace(':5000', ':3000')}/payment/success?tranId=${tranId}`);
});

// @desc    Payment Fail
// @route   POST /api/donations/payment/fail/:tranId
const paymentFail = asyncHandler(async (req, res) => {
    const { tranId } = req.params;
    const donation = await Donation.findOne({ 'ssl.tranId': tranId });

    if (donation) {
        donation.ssl.status = 'FAILED';
        await donation.save();
    }

    res.redirect(`${process.env.BASE_URL.replace(':5000', ':3000')}/payment/fail?tranId=${tranId}`);
});

// @desc    Payment Cancel
// @route   POST /api/donations/payment/cancel/:tranId
const paymentCancel = asyncHandler(async (req, res) => {
    const { tranId } = req.params;
    const donation = await Donation.findOne({ 'ssl.tranId': tranId });

    if (donation) {
        donation.ssl.status = 'CANCELLED';
        await donation.save();
    }

    res.redirect(`${process.env.BASE_URL.replace(':5000', ':3000')}/payment/cancel?tranId=${tranId}`);
});

// @desc    Get all donations (Admin)
// @route   GET /api/admin/donations
// @access  Private/Admin
const getDonations = asyncHandler(async (req, res) => {
    const donations = await Donation.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: donations });
});

module.exports = {
    initDonation,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    getDonations
};
