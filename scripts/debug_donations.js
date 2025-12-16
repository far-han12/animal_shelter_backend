const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const Donation = require('../models/donationModel');

dotenv.config({ path: './.env' }); // Adjust path if needed, usually just .env in root
// Actually, script is in backend/scripts, .env is in backend/.env. 
// Standard dotenv.config() looks in current cwd. If I run from backend root, it works.

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.underline.bold);
        process.exit(1);
    }
};

const checkDonations = async () => {
    await connectDB();

    const allDonations = await Donation.find({});
    console.log(`Total Donations Count: ${allDonations.length}`);

    const statusBreakdown = await Donation.aggregate([
        { $group: { _id: '$ssl.status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    console.log('Status Breakdown:');
    console.log(JSON.stringify(statusBreakdown, null, 2));

    const validDonations = await Donation.aggregate([
        { $match: { 'ssl.status': 'VALID' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    console.log('Total VALID Amount (Matches Dashboard Logic):', validDonations[0]?.total || 0);

    // Check for potential schema issues (e.g. types)
    allDonations.forEach(d => {
        if (typeof d.amount !== 'number') {
            console.log(`WARNING: Donation ${d._id} amount is not a number:`, d.amount, typeof d.amount);
        }
    });

    process.exit();
};

checkDonations();
