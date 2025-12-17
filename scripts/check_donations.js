const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Donation = require('../models/donationModel');

dotenv.config();
const connectDB = require('../config/db');

connectDB();

const checkDonations = async () => {
    try {
        const donations = await Donation.find({});
        console.log(`Found ${donations.length} donations.`);
        donations.forEach(d => {
            console.log(`- ID: ${d._id}`);
            console.log(`  Donor: ${d.donorName}`);
            console.log(`  UserId: ${d.userId || 'NULL (Anonymous)'}`);
            console.log(`  Status: ${d.ssl.status}`);
            console.log('---');
        });
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDonations();
