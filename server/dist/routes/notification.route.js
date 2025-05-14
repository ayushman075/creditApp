"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const notification_controller_1 = require("../controllers/notification.controller");
const notificationRouter = (0, express_1.Router)();
// Get all notifications for authenticated user
notificationRouter.route('/').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), notification_controller_1.getUserNotifications);
// Create a new notification (admin only)
notificationRouter.route('/').post((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), notification_controller_1.createNotification);
// Get unread notification count for authenticated user
notificationRouter.route('/unread/count').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), notification_controller_1.getUnreadNotificationCount);
// Mark all notifications as read for authenticated user
notificationRouter.route('/mark-all-read').patch((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), notification_controller_1.markAllNotificationsAsRead);
// Mark a specific notification as read
notificationRouter.route('/:id/read').patch((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), notification_controller_1.markNotificationAsRead);
// Delete a specific notification
notificationRouter.route('/:id').delete((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), notification_controller_1.deleteNotification);
exports.default = notificationRouter;
