const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/connectDB');
const fileUpload = require('express-fileupload');
const socketIo = require('socket.io');
const http = require('http');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

require('./sockets/chatSockets')(io);

(async () => {
    try {
        await connectDB();
        app.use(cors());
        app.use(express.json());

        app.use(express.json({ limit: '500mb' }));
        app.use(express.urlencoded({ limit: '500mb', extended: true }));

        app.use(fileUpload());

        app.get('/', (req, res) => {
            res.send('Welcome back to Perfect Host API!');
        });

        const authRoutes = require('./routes/v1/authRoute');
        app.use('/api/auth', authRoutes);

        const likeUserRoutes = require('./routes/v1/likeUserRoute');
        app.use('/api', likeUserRoutes);

        const feedbackUserRoutes = require('./routes/v1/feedbackUserRoute');
        app.use('/api', feedbackUserRoutes);

        const connectionUserRoute = require('./routes/v1/connectionUserRoute');
        app.use('/api', connectionUserRoute);

        const reportUserRoutes = require('./routes/v1/reportUserRoute');
        app.use('/api', reportUserRoutes);

        const hostFamilyRoutes = require('./routes/v1/hostFamilyRoute');
        app.use('/api', hostFamilyRoutes);

        const auPairRoutes = require('./routes/v1/auPairRoute');
        app.use('/api', auPairRoutes);

        const chatRoutes = require('./routes/v1/chatRoutes');
        app.use('/api/chat', chatRoutes);

        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ error: "Internal Server Error" });
        });

        server.listen(PORT, () => {
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