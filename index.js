const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/connectDB');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await connectDB();

        app.use(cors());
        app.use(express.json());
        // app.use('/uploads', express.static('uploads'));

        app.get('/', (req, res) => {
            res.send('Welcome back to Perfect Host API!');
        });

        const authRoutes = require('./routes/v1/authRoute');
        app.use('/api/auth', authRoutes);

        const hostFamilyRoutes = require('./routes/v1/hostFamilyRoute');
        app.use('/api', hostFamilyRoutes);

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