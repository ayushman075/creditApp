import { Request, Response } from 'express';
import dotenv from "dotenv";
import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./lib/prisma";

// Import routes
import authRouter from './routes/auth.route';
import accountRouter from './routes/account.route';
import cardRouter from './routes/card.route';
import loanRouter from './routes/loan.route';
import paymentRouter from './routes/payment.route';
import notificationRouter from './routes/notification.route';

// Initialize Express app
const app = express();

// Load environment variables
dotenv.config({
    path: '.env'
});

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost", "http://localhost:8000", "https://qulth.vercel.app"],
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH" , "DELETE"],
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));
app.use(express.static("public"));
app.use(cookieParser());

// API Routes
 app.use("/api/v1/auth",  authRouter);
 app.use("/api/v1/account", accountRouter);
 app.use("/api/v1/card", cardRouter);
 app.use("/api/v1/loan", loanRouter);
 app.use("/api/v1/payment", paymentRouter);
 app.use("/api/v1/notification", notificationRouter);

// Root route
app.get('/', (_req: Request, res: Response) => {
    res.send('Welcome to Qulth, on this line you are talking to Qulth server !!');
});

// Server start
const port = process.env.PORT || 3005;

// Graceful shutdown function
const shutdown = async () => {
  await prisma.$disconnect();
  console.log('Disconnected from database');
  process.exit(0);
};

// Connect and start server
async function startServer() {
  try {
    // Test the database connection
    await prisma.$connect();
    console.log('Connected to MongoDB with Prisma');
    
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
  } catch (err) {
    console.error("Error connecting to database !!", err);
    process.exit(1);
  }
}

startServer();

export default app;