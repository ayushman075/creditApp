import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Webhook } from 'svix';
import AsyncHandler from '../utils/AsyncHandler';
import ApiResponse from '../utils/ApiResponse';

const prisma = new PrismaClient();

// Define the auth interface 
interface AuthRequest extends Request {
  auth?: {
    userId: string;
  };
}

export const clerkWebhookListener = AsyncHandler(async (req: Request, res: Response) => {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET_KEY;
  
  if (!SIGNING_SECRET) {
    console.error('Error: SIGNING_SECRET is missing in environment variables.');
    return res.status(500).json(new ApiResponse(500, {}, 'Internal server error', false));
  }

  const webhook = new Webhook(SIGNING_SECRET);
  const headers = req.headers;
  const payload = JSON.stringify(req.body);
  
  const svix_id = headers['svix-id'] as string;
  const svix_timestamp = headers['svix-timestamp'] as string;
  const svix_signature = headers['svix-signature'] as string;
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json(
      new ApiResponse(400, {}, 'Missing Svix headers for webhook verification', false)
    );
  }

  let evt:any;
  try {
    evt = webhook.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err: any) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).json(
      new ApiResponse(400, {}, 'Webhook verification failed', false)
    );
  }

  const userData = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    try {
      const userEmail = userData.email_addresses?.[0]?.email_address;
      
      if (!userEmail) {
        return res.status(400).json(
          new ApiResponse(400, {}, 'Email address is required', false)
        );
      }

      const user = await prisma.user.upsert({
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
    } catch (error) {
      console.error('Error processing webhook data:', error);
      return res.status(500).json(
        new ApiResponse(500, {}, 'Error processing webhook data', false)
      );
    }
  }

  return res.status(200).json(
    new ApiResponse(200, {}, 'Webhook processed successfully', true)
  );
});



export const updateUserProfile = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const {  fullName } = req.body;

  const userId: string | undefined = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }
  
  if ( !fullName) {
    return res.status(409).json(
      new ApiResponse(409, {}, 'Some fields are empty', false)
    );
  }

  try {
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

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: fullName,
      }
    });


    return res.status(200).json(
      new ApiResponse(200, updatedUser, 'User updated successfully', true)
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error updating user', false)
    );
  }
});



export const getUserProfile = AsyncHandler(async (req: AuthRequest, res: Response) => {
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

    return res.status(200).json(
      new ApiResponse(200, user, 'User retrieved successfully', true)
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error fetching user', false)
    );
  }
});

// Get user by ID (admin only)
export const getUserById = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
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
      return res.status(403).json(
        new ApiResponse(403, {}, 'User not found', false)
      );
    }

    if (requester.role !== 'ADMIN') {
      return res.status(403).json(
        new ApiResponse(403, {}, 'Permission denied', false)
      );
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    return res.status(200).json(
      new ApiResponse(200, user, 'User retrieved successfully', true)
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error fetching user', false)
    );
  }
});