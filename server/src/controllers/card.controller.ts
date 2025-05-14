import { Request, Response } from 'express';
import { PrismaClient, CardType } from '@prisma/client';
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
 * Create a new card for the authenticated user
 */
export const createCard = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const { cardholderName, cardNumber,cvv,expiryMonth, balance,expiryYear, type, limit } = req.body;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  // Validate input data
  if (!cardholderName || !cardNumber || !cvv || !expiryMonth || !expiryYear || !type) {
    return res.status(400).json(
      new ApiResponse(400, {}, 'Missing required fields', false)
    );
  }

  // Validate card type
  if (!Object.values(CardType).includes(type)) {
    return res.status(400).json(
      new ApiResponse(400, {}, 'Invalid card type', false)
    );
  }

  try {
    // Find user by userId
    const user = await prisma.user.findFirst({
      where: { userId }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }


    // Create new card
    const newCard = await prisma.card.create({
      data: {
        cardNumber,
        cardholderName,
        expiryMonth,
        expiryYear,
        cvv,
        type,
        limit: type === CardType.CREDIT ? limit : null,
        balance: balance || 0,
        userId: user.id
      }
    });

    // Remove sensitive data before sending response
    const { cvv: _, ...cardResponse } = newCard;

    return res.status(201).json(
      new ApiResponse(201, cardResponse, 'Card added successfully', true)
    );
  } catch (error) {
    console.error('Error creating card:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error creating card', false)
    );
  }
});

/**
 * Get all cards for the authenticated user
 */
export const getUserCards = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  try {
    // Find user by userId
    const user = await prisma.user.findFirst({
      where: { userId }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    // Get user's cards
    const cards = await prisma.card.findMany({
      where: { 
        userId: user.id 
      },
      select: {
        id: true,
        cardNumber: true,
        cardholderName: true,
        expiryMonth: true,
        expiryYear: true,
        type: true,
        limit: true,
        balance: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(200).json(
      new ApiResponse(200, cards, 'Cards retrieved successfully', true)
    );
  } catch (error) {
    console.error('Error fetching cards:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error fetching cards', false)
    );
  }
});

/**
 * Get card details by ID
 */
export const getCardById = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const { cardId } = req.params;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  try {
    // Find user by userId
    const user = await prisma.user.findFirst({
      where: { userId }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    // Find card by ID and ensure it belongs to the user
    const card = await prisma.card.findFirst({
      where: { 
        id: cardId,
        userId: user.id 
      },
      select: {
        id: true,
        cardNumber: true,
        cardholderName: true,
        expiryMonth: true,
        expiryYear: true,
        type: true,
        limit: true,
        balance: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!card) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'Card not found or not authorized to access', false)
      );
    }

    return res.status(200).json(
      new ApiResponse(200, card, 'Card retrieved successfully', true)
    );
  } catch (error) {
    console.error('Error fetching card:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error fetching card', false)
    );
  }
});

/**
 * Update card details
 */
export const updateCard = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const { cardId } = req.params;
  const { cardholderName, expiryMonth, expiryYear, isActive, limit } = req.body;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  try {
    // Find user by userId
    const user = await prisma.user.findFirst({
      where: { userId }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    // Check if the card exists and belongs to the user
    const existingCard = await prisma.card.findFirst({
      where: { 
        id: cardId,
        userId: user.id 
      }
    });

    if (!existingCard) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'Card not found or not authorized to update', false)
      );
    }

    // Update card
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        cardholderName: cardholderName || existingCard.cardholderName,
        expiryMonth: expiryMonth !== undefined ? expiryMonth : existingCard.expiryMonth,
        expiryYear: expiryYear !== undefined ? expiryYear : existingCard.expiryYear,
        isActive: isActive !== undefined ? isActive : existingCard.isActive,
        limit: existingCard.type === 'CREDIT' && limit !== undefined ? limit : existingCard.limit
      },
      select: {
        id: true,
        cardNumber: true,
        cardholderName: true,
        expiryMonth: true,
        expiryYear: true,
        type: true,
        limit: true,
        balance: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(200).json(
      new ApiResponse(200, updatedCard, 'Card updated successfully', true)
    );
  } catch (error) {
    console.error('Error updating card:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error updating card', false)
    );
  }
});

/**
 * Block/unblock a card
 */
export const toggleCardStatus = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const { cardId } = req.params;
  const { isActive } = req.body;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  if (isActive === undefined) {
    return res.status(400).json(
      new ApiResponse(400, {}, 'isActive field is required', false)
    );
  }

  try {
    // Find user by userId
    const user = await prisma.user.findFirst({
      where: { userId }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    // Check if the card exists and belongs to the user
    const existingCard = await prisma.card.findFirst({
      where: { 
        id: cardId,
      }
    });

    if (!existingCard) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'Card not found or not authorized to update', false)
      );
    }

      if (user.role !== 'ADMIN' && existingCard.userId!==user.id) {
        return res.status(403).json(
        new ApiResponse(403, {}, 'User not authorized to update the card', false)
      );
      }
      

    // Toggle card status
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: { isActive },
      select: {
        id: true,
        cardNumber: true,
        cardholderName: true,
        expiryMonth: true,
        expiryYear: true,
        type: true,
        limit: true,
        balance: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const statusMessage = isActive ? 'activated' : 'deactivated';

    return res.status(200).json(
      new ApiResponse(200, updatedCard, `Card ${statusMessage} successfully`, true)
    );
  } catch (error) {
    console.error('Error updating card status:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error updating card status', false)
    );
  }
});

/**
 * Delete a card (For admins or account owners)
 */
export const deleteCard = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const { cardId } = req.params;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  try {
    // Find user by userId
    const user = await prisma.user.findFirst({
      where: { userId }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    // Check if user is admin or card owner
    if (user.role !== 'ADMIN') {
      const card = await prisma.card.findFirst({
        where: { 
          id: cardId,
          userId: user.id 
        }
      });
      
      if (!card) {
        return res.status(403).json(
          new ApiResponse(403, {}, 'Not authorized to delete this card', false)
        );
      }
    }

    // Check if card exists before deletion
    const existingCard = await prisma.card.findUnique({
      where: { id: cardId }
    });

    if (!existingCard) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'Card not found', false)
      );
    }

    // Delete the card
    await prisma.card.delete({
      where: { id: cardId }
    });

    return res.status(200).json(
      new ApiResponse(200, {}, 'Card deleted successfully', true)
    );
  } catch (error) {
    console.error('Error deleting card:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error deleting card', false)
    );
  }
});

/**
 * Get all card transactions
 */
export const getCardTransactions = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const { cardId } = req.params;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  try {
    // Find user by userId
    const user = await prisma.user.findFirst({
      where: { userId }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    // Check if the card exists and belongs to the user
    const card = await prisma.card.findFirst({
      where: { 
        id: cardId,
        userId: user.id 
      }
    });

    if (!card) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'Card not found or not authorized to access', false)
      );
    }

    // Get card transactions
    const transactions = await prisma.transaction.findMany({
      where: { cardId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(
      new ApiResponse(200, transactions, 'Card transactions retrieved successfully', true)
    );
  } catch (error) {
    console.error('Error fetching card transactions:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error fetching card transactions', false)
    );
  }
});

/**
 * Admin: Get all cards in the system
 */
export const getAllCards = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  try {
    // Find user by userId and check if admin
    const user = await prisma.user.findFirst({
      where: { userId }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json(
        new ApiResponse(403, {}, 'Admin permission required', false)
      );
    }

    // Get all cards (admin only)
    const cards = await prisma.card.findMany({
      select: {
        id: true,
        cardNumber: true,
        cardholderName: true,
        expiryMonth: true,
        expiryYear: true,
        type: true,
        limit: true,
        balance: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json(
      new ApiResponse(200, cards, 'All cards retrieved successfully', true)
    );
  } catch (error) {
    console.error('Error fetching all cards:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error fetching all cards', false)
    );
  }
});