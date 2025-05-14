import { Router } from "express";

import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { clerkWebhookListener, getUserById, getUserProfile, updateUserProfile } from "../controllers/user.controller";

const authRouter = Router();

// Clerk webhook endpoint (no auth required)
authRouter.route('/webhook/clerk').post(
  clerkWebhookListener
);

// Get user profile - requires authenticated user
authRouter.route('/profile').get(
  ClerkExpressRequireAuth(),
  getUserProfile
);

// Update user profile - requires authenticated user
authRouter.route('/profile/update').post(
  ClerkExpressRequireAuth(),
  updateUserProfile
);

// Get user by ID - requires authenticated user (admin check happens in controller)
authRouter.route('/user/:id').get(
  ClerkExpressRequireAuth(),
  getUserById
);

export default authRouter;