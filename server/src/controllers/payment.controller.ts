import { Request, Response } from 'express';
import { PrismaClient, PaymentStatus, PaymentMethod } from '@prisma/client';
import AsyncHandler from '../utils/AsyncHandler';
import ApiResponse from '../utils/ApiResponse';

const prisma = new PrismaClient();

// Define the auth interface 
interface AuthRequest extends Request {
  auth?: {
    userId: string;
  };
}

// Create a new payment
export const createPayment = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount, paymentMethod, dueDate, description, loanId } = req.body;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }
  
  if (!amount || !paymentMethod) {
    return res.status(400).json(
      new ApiResponse(400, {}, 'Amount and payment method are required', false)
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

    // If loan ID is provided, verify it exists and belongs to the user
    if (loanId) {
      const loan = await prisma.loan.findFirst({
        where: {
          id: loanId,
          application: {
            userId: user.id
          }
        }
      });

      if (!loan) {
        return res.status(404).json(
          new ApiResponse(404, {}, 'Loan not found or does not belong to user', false)
        );
      }
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        paymentMethod: paymentMethod as PaymentMethod,
        status: PaymentStatus.PENDING,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        description,
        userId: user.id,
        loanId: loanId || undefined,
      }
    });

    // Create a transaction for this payment
    if (payment) {
      await prisma.transaction.create({
        data: {
          amount: parseFloat(amount),
          type: 'PAYMENT',
          description: description || 'Payment transaction',
          status: 'PENDING',
          paymentId: payment.id
        }
      });
    }

    return res.status(201).json(
      new ApiResponse(201, payment, 'Payment created successfully', true)
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error creating payment', false)
    );
  }
});

// Get a user's payments
export const getUserPayments = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.auth?.userId;
  const { status, loanId } = req.query;
  
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

    // Build filter conditions
    const whereConditions: any = {
      userId: user.id
    };

    if (status) {
      whereConditions.status = status;
    }

    if (loanId) {
      whereConditions.loanId = loanId as string;
    }

    // Get payments
    const payments = await prisma.payment.findMany({
      where: whereConditions,
      include: {
        loan: true,
        transaction: true
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });

    return res.status(200).json(
      new ApiResponse(200, payments, 'Payments retrieved successfully', true)
    );
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error fetching payments', false)
    );
  }
});

// Get payment by ID
export const getPaymentById = AsyncHandler(async (req: AuthRequest, res: Response) => {
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

    // Get payment
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        loan: true,
        transaction: true
      }
    });

    if (!payment) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'Payment not found', false)
      );
    }

    return res.status(200).json(
      new ApiResponse(200, payment, 'Payment retrieved successfully', true)
    );
  } catch (error) {
    console.error('Error fetching payment:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error fetching payment', false)
    );
  }
});

// Update payment status
export const updatePaymentStatus = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  if (!status || !Object.values(PaymentStatus).includes(status as PaymentStatus)) {
    return res.status(400).json(
      new ApiResponse(400, {}, 'Valid status is required', false)
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

    // Check if payment exists and belongs to user
    const existingPayment = await prisma.payment.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        transaction: true
      }
    });

    if (!existingPayment) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'Payment not found or unauthorized', false)
      );
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: status as PaymentStatus,
      },
      include: {
        transaction: true,
        loan: true
      }
    });

    // If there's an associated transaction, update its status too
    if (existingPayment.transaction) {
      await prisma.transaction.update({
        where: { id: existingPayment.transaction.id },
        data: {
          status: status === 'COMPLETED' ? 'COMPLETED' : status === 'FAILED' ? 'FAILED' : status === 'CANCELLED' ? 'CANCELLED' : 'PENDING'
        }
      });
    }

    // If payment is completed and linked to a loan, update the loan's outstanding amount
    if (status === 'COMPLETED' && updatedPayment.loanId) {
      const loan = await prisma.loan.findUnique({
        where: { id: updatedPayment.loanId }
      });
      
      if (loan) {
        const newOutstandingAmount = Math.max(0, loan.outstandingAmount - updatedPayment.amount);
        
        await prisma.loan.update({
          where: { id: updatedPayment.loanId },
          data: { 
            outstandingAmount: newOutstandingAmount,
            status: newOutstandingAmount <= 0 ? 'PAID' : 'ACTIVE'
          }
        });
      }
    }

    // Create notification for payment status update
    await prisma.notification.create({
      data: {
        title: `Payment ${status.toLowerCase()}`,
        message: `Your payment of ${updatedPayment.amount} has been ${status.toLowerCase()}.`,
        type: 'PAYMENT_CONFIRMATION',
        userId: user.id
      }
    });

    return res.status(200).json(
      new ApiResponse(200, updatedPayment, 'Payment status updated successfully', true)
    );
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error updating payment status', false)
    );
  }
});

// Admin: Get all payments
export const getAllPayments = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const authUserId = req.auth?.userId;
  const { status, userId: queryUserId, loanId } = req.query;
  
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
        new ApiResponse(403, {}, 'Permission denied', false)
      );
    }

    // Build filter conditions
    const whereConditions: any = {};

    if (status) {
      whereConditions.status = status;
    }

    if (queryUserId) {
      whereConditions.userId = queryUserId as string;
    }

    if (loanId) {
      whereConditions.loanId = loanId as string;
    }

    // Get all payments
    const payments = await prisma.payment.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        loan: true,
        transaction: true
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });

    return res.status(200).json(
      new ApiResponse(200, payments, 'All payments retrieved successfully', true)
    );
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error fetching payments', false)
    );
  }
});

// Delete a payment (admin only)
export const deletePayment = AsyncHandler(async (req: AuthRequest, res: Response) => {
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
      return res.status(404).json(
        new ApiResponse(404, {}, 'User not found', false)
      );
    }

    if (requester.role !== 'ADMIN') {
      return res.status(403).json(
        new ApiResponse(403, {}, 'Permission denied', false)
      );
    }

    // Find the payment first
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        transaction: true
      }
    });

    if (!payment) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'Payment not found', false)
      );
    }

    // Delete the associated transaction first if it exists
    if (payment.transaction) {
      await prisma.transaction.delete({
        where: { id: payment.transaction.id }
      });
    }

    // Delete the payment
    await prisma.payment.delete({
      where: { id }
    });

    return res.status(200).json(
      new ApiResponse(200, {}, 'Payment deleted successfully', true)
    );
  } catch (error) {
    console.error('Error deleting payment:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error deleting payment', false)
    );
  }
});

// Create payment reminder for a loan
export const createPaymentReminder = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const { loanId, dueDate, amount, description } = req.body;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, {}, 'Unauthorized Request', false)
    );
  }

  if (!loanId || !dueDate || !amount) {
    return res.status(400).json(
      new ApiResponse(400, {}, 'Loan ID, due date, and amount are required', false)
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

    // Verify loan exists and belongs to user
    const loan = await prisma.loan.findFirst({
      where: {
        id: loanId,
        application: {
          userId: user.id
        }
      }
    });

    if (!loan) {
      return res.status(404).json(
        new ApiResponse(404, {}, 'Loan not found or does not belong to user', false)
      );
    }

    // Create payment with future due date
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        paymentMethod: PaymentMethod.AUTOMATIC_DEBIT,
        status: PaymentStatus.PENDING,
        dueDate: new Date(dueDate),
        description: description || `Scheduled payment for loan ${loan.loanNumber}`,
        userId: user.id,
        loanId: loanId
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        title: 'Payment Reminder Created',
        message: `A payment reminder of ${amount} has been set for ${new Date(dueDate).toLocaleDateString()}.`,
        type: 'PAYMENT_REMINDER',
        userId: user.id
      }
    });

    return res.status(201).json(
      new ApiResponse(201, payment, 'Payment reminder created successfully', true)
    );
  } catch (error) {
    console.error('Error creating payment reminder:', error);
    return res.status(500).json(
      new ApiResponse(500, {}, 'Error creating payment reminder', false)
    );
  }
});