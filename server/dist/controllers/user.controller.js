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
exports.getUserById = exports.getUserProfile = exports.updateUserProfile = exports.clerkWebhookListener = void 0;
const client_1 = require("@prisma/client");
const svix_1 = require("svix");
const AsyncHandler_1 = __importDefault(require("../utils/AsyncHandler"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const prisma = new client_1.PrismaClient();
exports.clerkWebhookListener = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET_KEY;
    if (!SIGNING_SECRET) {
        console.error('Error: SIGNING_SECRET is missing in environment variables.');
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Internal server error', false));
    }
    const webhook = new svix_1.Webhook(SIGNING_SECRET);
    const headers = req.headers;
    const payload = JSON.stringify(req.body);
    const svix_id = headers['svix-id'];
    const svix_timestamp = headers['svix-timestamp'];
    const svix_signature = headers['svix-signature'];
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'Missing Svix headers for webhook verification', false));
    }
    let evt;
    try {
        evt = webhook.verify(payload, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });
    }
    catch (err) {
        console.error('Webhook verification failed:', err.message);
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'Webhook verification failed', false));
    }
    const userData = evt.data;
    const eventType = evt.type;
    if (eventType === 'user.created' || eventType === 'user.updated') {
        try {
            const userEmail = (_b = (_a = userData.email_addresses) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.email_address;
            if (!userEmail) {
                return res.status(400).json(new ApiResponse_1.default(400, {}, 'Email address is required', false));
            }
            const user = yield prisma.user.upsert({
                where: {
                    email: userEmail
                },
                update: {
                    name: `${userData.first_name} ${userData.last_name}`,
                },
                create: {
                    userId: userData.id,
                    email: userEmail,
                    name: `${userData.first_name} ${userData.last_name}`,
                    role: 'USER',
                }
            });
        }
        catch (error) {
            console.error('Error processing webhook data:', error);
            return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error processing webhook data', false));
        }
    }
    return res.status(200).json(new ApiResponse_1.default(200, {}, 'Webhook processed successfully', true));
}));
exports.updateUserProfile = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { fullName } = req.body;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    if (!fullName) {
        return res.status(409).json(new ApiResponse_1.default(409, {}, 'Some fields are empty', false));
    }
    try {
        const user = yield prisma.user.findFirst({
            where: {
                userId: userId
            }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        const updatedUser = yield prisma.user.update({
            where: { id: user.id },
            data: {
                name: fullName,
            }
        });
        return res.status(200).json(new ApiResponse_1.default(200, updatedUser, 'User updated successfully', true));
    }
    catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error updating user', false));
    }
}));
exports.getUserProfile = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: {
                userId: userId
            }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        return res.status(200).json(new ApiResponse_1.default(200, user, 'User retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching user', false));
    }
}));
// Get user by ID (admin only)
exports.getUserById = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const authUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!authUserId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Check if requester is admin
        const requester = yield prisma.user.findFirst({
            where: { userId: authUserId }
        });
        if (!requester) {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'User not found', false));
        }
        if (requester.role !== 'ADMIN') {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Permission denied', false));
        }
        const user = yield prisma.user.findUnique({
            where: { id }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        return res.status(200).json(new ApiResponse_1.default(200, user, 'User retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching user', false));
    }
}));
