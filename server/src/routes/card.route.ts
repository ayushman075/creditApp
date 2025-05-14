import { Router } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { 
  createCard, 
  getUserCards, 
  getCardById, 
  updateCard, 
  toggleCardStatus, 
  deleteCard, 
  getCardTransactions, 
  getAllCards 
} from "../controllers/card.controller";

const cardRouter = Router();

// Create a new card - requires authenticated user
cardRouter.route('/create').post(
  ClerkExpressRequireAuth(),
  createCard
);

// Get all cards for authenticated user
cardRouter.route('/').get(
  ClerkExpressRequireAuth(),
  getUserCards
);

// Get specific card by ID
cardRouter.route('/:cardId').get(
  ClerkExpressRequireAuth(),
  getCardById
);

// Update card details
cardRouter.route('/:cardId/update').put(
  ClerkExpressRequireAuth(),
  updateCard
);

// Toggle card active status (block/unblock)
cardRouter.route('/:cardId/toggle-status').patch(
  ClerkExpressRequireAuth(),
  toggleCardStatus
);

// Delete a card
cardRouter.route('/:cardId/delete').delete(
  ClerkExpressRequireAuth(),
  deleteCard
);

// Get all transactions for a specific card
cardRouter.route('/:cardId/transactions').get(
  ClerkExpressRequireAuth(),
  getCardTransactions
);

// Admin route: Get all cards in the system
cardRouter.route('/admin/all').get(
  ClerkExpressRequireAuth(),
  getAllCards
);

export default cardRouter;