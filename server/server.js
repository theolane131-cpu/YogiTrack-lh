const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Routes
const reportRoutes = require('./routes/reportRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const saleRoutes = require('./routes/saleRoutes');
const classRoutes = require('./routes/classRoutes');
const packageRoutes = require('./routes/packageRoutes');
const customerRoutes = require('./routes/customerRoutes');
const instructorRoutes = require('./routes/instructorRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/instructors', instructorRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

/* ===============================
   🔥 HEROKU STEP 3 ADDITION BELOW
   =============================== */

// Serve React frontend (after build)
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

/* ===============================
   END HEROKU STEP 3 ADDITION
   =============================== */

// Test route (optional, but keep above if needed)
// NOTE: This won't show anymore once React is served
// app.get('/', (req, res) => {
//     res.send('YogiTrack API is running');
// });

// Server setup
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});