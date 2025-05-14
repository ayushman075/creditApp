import { Router } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { 
  getUserNotifications, 
  createNotification, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  getUnreadNotificationCount
} from "../controllers/notification.controller";

const notificationRouter = Router();

// Get all notifications for authenticated user
notificationRouter.route('/').get(
  ClerkExpressRequireAuth(),
  getUserNotifications
);

// Create a new notification (admin only)
notificationRouter.route('/').post(
  ClerkExpressRequireAuth(),
  createNotification
);

// Get unread notification count for authenticated user
notificationRouter.route('/unread/count').get(
  ClerkExpressRequireAuth(),
  getUnreadNotificationCount
);

// Mark all notifications as read for authenticated user
notificationRouter.route('/mark-all-read').patch(
  ClerkExpressRequireAuth(),
  markAllNotificationsAsRead
);

// Mark a specific notification as read
notificationRouter.route('/:id/read').patch(
  ClerkExpressRequireAuth(),
  markNotificationAsRead
);

// Delete a specific notification
notificationRouter.route('/:id').delete(
  ClerkExpressRequireAuth(),
  deleteNotification
);

export default notificationRouter;