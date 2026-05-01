import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import cookieParser from 'cookie-parser'
import { connectDB } from "./config/db";
import { healthRouter } from "./routes/healthRoutes";
import authRoutes from './routes/authRoutes'
import chatRoutes from './routes/chatRoutes';
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // Required for cookies (refresh tokens later)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser()); 

// Routes
app.use("/api/health", healthRouter);
app.use('/api/auth', authRoutes)
app.use('/api/chat/conversations', chatRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV}`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});