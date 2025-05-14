"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const card_controller_1 = require("../controllers/card.controller");
const cardRouter = (0, express_1.Router)();
// Create a new card - requires authenticated user
cardRouter.route('/create').post((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), card_controller_1.createCard);
// Get all cards for authenticated user
cardRouter.route('/').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), card_controller_1.getUserCards);
// Get specific card by ID
cardRouter.route('/:cardId').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), card_controller_1.getCardById);
// Update card details
cardRouter.route('/:cardId/update').put((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), card_controller_1.updateCard);
// Toggle card active status (block/unblock)
cardRouter.route('/:cardId/toggle-status').patch((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), card_controller_1.toggleCardStatus);
// Delete a card
cardRouter.route('/:cardId/delete').delete((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), card_controller_1.deleteCard);
// Get all transactions for a specific card
cardRouter.route('/:cardId/transactions').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), card_controller_1.getCardTransactions);
// Admin route: Get all cards in the system
cardRouter.route('/admin/all').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), card_controller_1.getAllCards);
exports.default = cardRouter;
