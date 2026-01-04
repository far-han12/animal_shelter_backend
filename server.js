const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Fix for SSLCommerz Sandbox SSL issues in development
console.log(`Current NODE_ENV: ${process.env.NODE_ENV}`);
if (process.env.NODE_ENV === 'development') {
    console.log('Applying SSLCommerz Sandbox SSL Fix (NODE_TLS_REJECT_UNAUTHORIZED = 0)');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false, // For serving images
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '/public/uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/adoptions', require('./routes/adoptionRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => {
    res.json({ message: 'Animal Shelter API is running...' });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

module.exports = app;
