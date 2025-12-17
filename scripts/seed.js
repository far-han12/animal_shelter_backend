const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../models/userModel');
const Pet = require('../models/petModel');
const Story = require('../models/storyModel');
const Event = require('../models/eventModel');
const AdoptionInquiry = require('../models/adoptionInquiryModel');
const AdoptionApplication = require('../models/adoptionApplicationModel');
const VolunteerApplication = require('../models/volunteerApplicationModel');
const Donation = require('../models/donationModel');

dotenv.config();
const connectDB = require('../config/db');

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Pet.deleteMany();
        await Story.deleteMany();
        await Event.deleteMany();
        await AdoptionInquiry.deleteMany();
        await AdoptionApplication.deleteMany();
        await VolunteerApplication.deleteMany();
        await Donation.deleteMany();

        console.log('Data Destroyed...'.red.inverse);

        // USERS
        const createdUsers = await User.insertMany([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                passwordHash: '123456', // Will be hashed by pre-save hooks? NO, insertMany bypasses hooks! 
                // Wait, insertMany DOES NOT trigger pre-save middleware in Mongoose usually unless specified, but for hashing I should use create or manually hash.
                // Let's use create loop or manually hash here for simplicity, OR rely on the fact that I should probably use a loop.
                // Actually, let's fix this.
                role: 'ADMIN',
                phone: '01700000000'
            },
            {
                name: 'John Doe',
                email: 'user@example.com',
                passwordHash: '123456',
                role: 'USER',
                phone: '01700000001'
            },
            {
                name: 'Jane Smith',
                email: 'user2@example.com',
                passwordHash: '123456',
                role: 'USER',
                phone: '01700000002'
            }
        ]);

        // Hashing fix: The above insertMany bypasses headers.
        // We will manually loop and save to trigger hooks, or hash them now.
        // Let's rely on a helper or just re-save them.
        for (const user of createdUsers) {
            user.passwordHash = '123456'; // Reset to plain text to trigger hash? No, save() usually triggers only if modified.
            // Better to iterate and create.
        }
        // Actually, deleting and re-creating one by one is safer for hooks.
        await User.deleteMany(); // Clear again

        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            passwordHash: '123456',
            role: 'ADMIN',
            phone: '01700000000'
        });

        const user1 = await User.create({
            name: 'John Doe',
            email: 'user@example.com',
            passwordHash: '123456',
            role: 'USER',
            phone: '01700000001'
        });

        const user2 = await User.create({
            name: 'Jane Smith',
            email: 'user2@example.com',
            passwordHash: '123456',
            role: 'USER',
            phone: '01700000003'
        });

        console.log('Users Imported'.green.inverse);

        // PETS
        const pets = await Pet.create([
            {
                name: 'Buddy',
                species: 'Dog',
                breed: 'Golden Retriever',
                age: 2,
                size: 'Large',
                gender: 'Male',
                description: 'Friendly and energetic dog looking for a loving home.',
                photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d'],
                status: 'AVAILABLE',
                submittedByUserId: null // Admin
            },
            {
                name: 'Mittens',
                species: 'Cat',
                breed: 'Siamese',
                age: 1,
                size: 'Small',
                gender: 'Female',
                description: 'Quiet and affectionate cat.',
                photos: ['https://images.unsplash.com/photo-1513245543132-31f507417b26'],
                status: 'AVAILABLE',
                submittedByUserId: null
            },
            {
                name: 'Rocky',
                species: 'Dog',
                breed: 'Bulldog',
                age: 4,
                size: 'Medium',
                gender: 'Male',
                description: 'Loyal companion.',
                photos: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e'],
                status: 'PENDING_ADOPTION',
                submittedByUserId: null
            },
            {
                name: 'Luna',
                species: 'Cat',
                breed: 'Persian',
                age: 3,
                size: 'Small',
                gender: 'Female',
                description: 'Fluffy and chill.',
                photos: ['https://images.unsplash.com/photo-1533743983669-94fa5c4338ec'],
                status: 'ADOPTED',
                submittedByUserId: null
            },
            {
                name: 'Max',
                species: 'Dog',
                breed: 'German Shepherd',
                age: 1,
                size: 'Large',
                gender: 'Male',
                description: 'User submitted pup awaiting review.',
                photos: ['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95'],
                status: 'PENDING_REVIEW',
                submittedByUserId: user1._id,
                ownerContact: { name: 'John', phone: '017000', email: 'john@example.com' }
            },
            {
                name: 'Charlie',
                species: 'Dog',
                breed: 'Beagle',
                age: 2,
                size: 'Medium',
                gender: 'Male',
                description: 'Happy go lucky.',
                photos: ['https://images.unsplash.com/photo-1537151608828-ea2b11777ee8'],
                status: 'ADOPTED',
                submittedByUserId: user1._id,
                ownerContact: { name: 'John Doe', phone: '01700000001', email: 'user@example.com' }
            }
        ]);
        console.log('Pets Imported'.green.inverse);

        // STORIES
        await Story.create([
            {
                title: 'Luna finds a home',
                slug: 'luna-finds-a-home',
                body: 'Luna was shy at first but now rules the house...',
                coverImage: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec',
                galleryImages: []
            },
            {
                title: 'Rescue Mission 2024',
                slug: 'rescue-mission-2024',
                body: 'We saved 50 animals this month!',
                coverImage: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e',
                galleryImages: []
            }
        ]);
        console.log('Stories Imported'.green.inverse);

        // EVENTS
        await Event.create([
            {
                title: 'Adoption Fair',
                slug: 'adoption-fair-2024',
                description: 'Come meet our pets!',
                location: 'City Park',
                startDateTime: new Date('2024-12-25'),
                images: ['https://images.unsplash.com/photo-1516734212186-a967f4368592']
            },
            {
                title: 'Fundraising Gala',
                slug: 'gala-2024',
                description: 'Annual fundraiser.',
                location: 'Grand Hotel',
                startDateTime: new Date('2024-11-20'), // Past
                images: []
            }
        ]);
        console.log('Events Imported'.green.inverse);

        // INQUIRIES
        await AdoptionInquiry.create({
            petId: pets[0]._id, // Buddy
            name: 'Interested Person',
            email: 'interested@example.com',
            phone: '019000000',
            message: 'Is Buddy good with kids?',
            status: 'NEW'
        });

        // APPLICATIONS
        await AdoptionApplication.create([
            {
                petId: pets[2]._id, // Rocky (Pending Adoption)
                userId: user2._id,
                applicantInfo: {
                    address: '123 Fake St',
                    experience: 'Had dogs before',
                    householdInfo: 'Single, no kids',
                    notes: 'I work from home'
                },
                status: 'PENDING'
            },
            {
                petId: pets[3]._id, // Luna (Adopted - Shelter Pet)
                userId: user1._id, // User 1 adopts Luna
                applicantInfo: {
                    address: '456 Real St',
                    experience: 'First cat',
                    householdInfo: 'Large family',
                    notes: 'Kids love cats'
                },
                status: 'APPROVED',
                adminNote: 'Great fit for the family!'
            },
            {
                petId: pets[5]._id, // Charlie (Adopted - User Submitted Pet)
                userId: user2._id, // User 2 adopts Charlies from User 1
                applicantInfo: {
                    address: '789 Another St',
                    experience: 'Love beagles',
                    householdInfo: 'Couple',
                    notes: 'We have a big yard'
                },
                status: 'APPROVED',
                adminNote: 'Owner approved transfer.'
            }
        ]);

        // VOLUNTEERS
        await VolunteerApplication.create({
            name: 'Sam Volunteer',
            email: 'sam@example.com',
            phone: '01555555',
            availability: 'Weekends',
            status: 'PENDING'
        });

        // DONATIONS
        await Donation.create([
            {
                donorName: 'John Doe',
                donorEmail: 'user@example.com',
                donorPhone: '01700000001',
                amount: 500,
                purpose: 'GENERAL',
                userId: user1._id, // Link to John Doe
                ssl: { tranId: 'TRX123', status: 'VALID', valId: 'VAL123' }
            },
            {
                donorName: 'John Doe',
                donorEmail: 'user@example.com',
                donorPhone: '01700000001',
                amount: 1000,
                purpose: 'SPONSOR_PET',
                petId: pets[0]._id, // Sponsor Buddy
                userId: user1._id, // Link to John Doe
                ssl: { tranId: 'TRX456', status: 'VALID', valId: 'VAL456' }
            }
        ]);

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Pet.deleteMany();
        await Story.deleteMany();
        await Event.deleteMany();
        await AdoptionInquiry.deleteMany();
        await AdoptionApplication.deleteMany();
        await VolunteerApplication.deleteMany();
        await Donation.deleteMany();

        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '--reset') {
    destroyData();
} else {
    importData();
}
