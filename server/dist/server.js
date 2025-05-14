"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const prisma_1 = require("./lib/prisma");
// Import routes
// import authRouter from "./routes/auth.route";
// import questionRouter from "./routes/question.route";
// import commentRouter from "./routes/comment.route";
// import likeRouter from "./routes/like.route";
// Initialize Express app
const app = (0, express_1.default)();
// Load environment variables
dotenv_1.default.config({
    path: '.env'
});
// Middleware
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost", "http://localhost:8000", "https://qulth.vercel.app"],
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    credentials: true
}));
app.use(express_1.default.json({ limit: "16kb" }));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: "16kb"
}));
app.use(express_1.default.static("public"));
app.use((0, cookie_parser_1.default)());
// API Routes
// app.use("/api/v1/auth", express.raw({ type: "application/json" }), authRouter);
// app.use("/api/v1/question", questionRouter);
// app.use("/api/v1/comment", commentRouter);
// app.use("/api/v1/like", likeRouter);
// Root route
app.get('/', (_req, res) => {
    res.send('Welcome to Qulth, on this line you are talking to Qulth server !!');
});
// Server start
const port = process.env.PORT || 3005;
// Graceful shutdown function
const shutdown = () => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.prisma.$disconnect();
    console.log('Disconnected from database');
    process.exit(0);
});
// Connect and start server
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Test the database connection
            yield prisma_1.prisma.$connect();
            console.log('Connected to MongoDB with Prisma');
            app.listen(port, () => {
                console.log(`Server listening on port ${port}`);
            });
            // Handle graceful shutdown
            process.on('SIGINT', shutdown);
            process.on('SIGTERM', shutdown);
        }
        catch (err) {
            console.error("Error connecting to database !!", err);
            process.exit(1);
        }
    });
}
startServer();
exports.default = app;
