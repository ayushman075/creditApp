"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const user_controller_1 = require("../controllers/user.controller");
const authRouter = (0, express_1.Router)();
// Clerk webhook endpoint (no auth required)
authRouter.route('/webhook/clerk').post(user_controller_1.clerkWebhookListener);
// Get user profile - requires authenticated user
authRouter.route('/profile').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), user_controller_1.getUserProfile);
// Update user profile - requires authenticated user
authRouter.route('/profile/update').post((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), user_controller_1.updateUserProfile);
// Get user by ID - requires authenticated user (admin check happens in controller)
authRouter.route('/user/:id').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), user_controller_1.getUserById);
exports.default = authRouter;
