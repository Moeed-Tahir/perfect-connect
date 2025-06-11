const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/connectDB');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await connectDB();

        // Middleware
        app.use(cors());
        app.use(express.json());
        // app.use('/uploads', express.static('uploads'));

        // Test route
        app.get('/', (req, res) => {
            res.send('Welcome back to Perfect Host API!');
        });

        // Routes
        const authRoutes = require('./routes/v1/authRoute');
        app.use('/api/auth', authRoutes);

        // Global error handler
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ error: "Internal Server Error" });
        });

        // Start server
        app.listen(PORT, () => {
            console.log(`
      =============================================
       Server successfully started!
       Port: ${PORT}
       Environment: ${process.env.NODE_ENV || 'development'}
       Timestamp: ${new Date().toISOString()}
      =============================================
      `);
        });

    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
})();