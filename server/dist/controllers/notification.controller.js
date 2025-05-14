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
exports.getUnreadNotificationCount = exports.createSystemNotification = exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.createNotification = exports.getUserNotifications = void 0;
const client_1 = require("@prisma/client");
const AsyncHandler_1 = __importDefault(require("../utils/AsyncHandler"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const prisma = new client_1.PrismaClient();
/**
 * Get all notifications for the authenticated user
 */
exports.getUserNotifications = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Get all notifications for the user
        const notifications = yield prisma.notification.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return res.status(200).json(new ApiResponse_1.default(200, notifications, 'Notifications retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching notifications', false));
    }
}));
/**
 * Create a new notification for a user
 */
exports.createNotification = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, message, type, userId: targetUserId } = req.body;
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
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        if (requester.role !== 'ADMIN') {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Permission denied. Only admins can create notifications for other users', false));
        }
        // Find target user
        const targetUser = yield prisma.user.findUnique({
            where: { id: targetUserId }
        });
        if (!targetUser) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Target user not found', false));
        }
        // Validate notification type
        if (!Object.values(client_1.NotificationType).includes(type)) {
            return res.status(400).json(new ApiResponse_1.default(400, {}, 'Invalid notification type', false));
        }
        // Create notification
        const notification = yield prisma.notification.create({
            data: {
                title,
                message,
                type: type,
                userId: targetUser.id
            }
        });
        return res.status(201).json(new ApiResponse_1.default(201, notification, 'Notification created successfully', true));
    }
    catch (error) {
        console.error('Error creating notification:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error creating notification', false));
    }
}));
/**
 * Mark a notification as read
 */
exports.markNotificationAsRead = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
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
        // Find notification
        const notification = yield prisma.notification.findUnique({
            where: { id }
        });
        if (!notification) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Notification not found', false));
        }
        // Ensure the notification belongs to the user
        if (notification.userId !== user.id) {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Permission denied. You can only mark your own notifications as read', false));
        }
        // Update notification status
        const updatedNotification = yield prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        return res.status(200).json(new ApiResponse_1.default(200, updatedNotification, 'Notification marked as read', true));
    }
    catch (error) {
        console.error('Error updating notification:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error updating notification', false));
    }
}));
/**
 * Mark all notifications as read for a user
 */
exports.markAllNotificationsAsRead = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Update all unread notifications
        const result = yield prisma.notification.updateMany({
            where: {
                userId: user.id,
                isRead: false
            },
            data: {
                isRead: true
            }
        });
        return res.status(200).json(new ApiResponse_1.default(200, { count: result.count }, `${result.count} notifications marked as read`, true));
    }
    catch (error) {
        console.error('Error updating notifications:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error updating notifications', false));
    }
}));
/**
 * Delete a notification
 */
exports.deleteNotification = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
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
        // Find notification
        const notification = yield prisma.notification.findUnique({
            where: { id }
        });
        if (!notification) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Notification not found', false));
        }
        // Check if the user owns the notification or is an admin
        if (notification.userId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Permission denied. You can only delete your own notifications', false));
        }
        // Delete notification
        yield prisma.notification.delete({
            where: { id }
        });
        return res.status(200).json(new ApiResponse_1.default(200, {}, 'Notification deleted successfully', true));
    }
    catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error deleting notification', false));
    }
}));
/**
 * Create system notification function (for internal use)
 */
const createSystemNotification = (userId, title, message, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create notification
        const notification = yield prisma.notification.create({
            data: {
                title,
                message,
                type,
                userId
            }
        });
        return { success: true, notification };
    }
    catch (error) {
        console.error('Error creating system notification:', error);
        return { success: false, error };
    }
});
exports.createSystemNotification = createSystemNotification;
/**
 * Get unread notification count for the authenticated user
 */
exports.getUnreadNotificationCount = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Count unread notifications
        const count = yield prisma.notification.count({
            where: {
                userId: user.id,
                isRead: false
            }
        });
        return res.status(200).json(new ApiResponse_1.default(200, { count }, 'Unread notification count retrieved', true));
    }
    catch (error) {
        console.error('Error counting notifications:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error counting notifications', false));
    }
}));
