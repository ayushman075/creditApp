import { Request, Response } from 'express';
import { PrismaClient, NotificationType } from '@prisma/client';
import AsyncHandler from '../utils/AsyncHandler';
import ApiResponse from '../utils/ApiResponse';

const prisma = new PrismaClient();

// Define the auth interface 
interface AuthRequest extends Request {
  auth?: {
    userId: string;
  };
}

/**
 * Get all notifications for the authenticated user
 */
export const getUserNotifications = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  try {
    // Find user by userId (from Clerk)
    const user = await prisma.user.findFirst({
      where: {
        userId: userId
      }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    // Get all notifications for the user
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json(
      new ApiResponse(200, notifications, 'Notifications retrieved successfully', true)
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error fetching notifications', false)
    );
  }
});

/**
 * Create a new notification for a user
 */
export const createNotification = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, message, type, userId: targetUserId } = req.body;
  const authUserId = req.auth?.userId;
  
  if (!authUserId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  try {
    // Check if requester is admin
    const requester = await prisma.user.findFirst({
      where: { userId: authUserId }
    });

    if (!requester) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    if (requester.role !== 'ADMIN') {
      return res.status(403).json(
        new ApiResponse(403, {}, 'Permission denied. Only admins can create notifications for other users', false)
      );
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'Target user not found', false)
      );
    }

    // Validate notification type
    if (!Object.values(NotificationType).includes(type as NotificationType)) {
      return res.status(400).json(
        new ApiResponse(400, {}, 'Invalid notification type', false)
      );
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: type as NotificationType,
        userId: targetUser.id
      }
    });

    return res.status(201).json(
      new ApiResponse(201, notification, 'Notification created successfully', true)
    );
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error creating notification', false)
    );
  }
});

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  try {
    // Find user by userId (from Clerk)
    const user = await prisma.user.findFirst({
      where: {
        userId: userId
      }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    // Find notification
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'Notification not found', false)
      );
    }

    // Ensure the notification belongs to the user
    if (notification.userId !== user.id) {
      return res.status(403).json(
        new ApiResponse(403, {}, 'Permission denied. You can only mark your own notifications as read', false)
      );
    }

    // Update notification status
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return res.status(200).json(
      new ApiResponse(200, updatedNotification, 'Notification marked as read', true)
    );
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error updating notification', false)
    );
  }
});

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  try {
    // Find user by userId (from Clerk)
    const user = await prisma.user.findFirst({
      where: {
        userId: userId
      }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    // Update all unread notifications
    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return res.status(200).json(
      new ApiResponse(200, { count: result.count }, `${result.count} notifications marked as read`, true)
    );
  } catch (error) {
    console.error('Error updating notifications:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error updating notifications', false)
    );
  }
});

/**
 * Delete a notification
 */
export const deleteNotification = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  try {
    // Find user by userId (from Clerk)
    const user = await prisma.user.findFirst({
      where: {
        userId: userId
      }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    // Find notification
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'Notification not found', false)
      );
    }

    // Check if the user owns the notification or is an admin
    if (notification.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json(
        new ApiResponse(403, {}, 'Permission denied. You can only delete your own notifications', false)
      );
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id }
    });

    return res.status(200).json(
      new ApiResponse(200, {}, 'Notification deleted successfully', true)
    );
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error deleting notification', false)
    );
  }
});

/**
 * Create system notification function (for internal use)
 */
export const createSystemNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType
) => {
  try {
    // Create notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId
      }
    });
    
    return { success: true, notification };
  } catch (error) {
    console.error('Error creating system notification:', error);
    return { success: false, error };
  }
};

/**
 * Get unread notification count for the authenticated user
 */
export const getUnreadNotificationCount = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  try {
    // Find user by userId (from Clerk)
    const user = await prisma.user.findFirst({
      where: {
        userId: userId
      }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    // Count unread notifications
    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false
      }
    });

    return res.status(200).json(
      new ApiResponse(200, { count }, 'Unread notification count retrieved', true)
    );
  } catch (error) {
    console.error('Error counting notifications:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error counting notifications', false)
    );
  }
});