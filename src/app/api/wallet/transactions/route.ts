import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Transaction } from '@/models';

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Get transaction history
 *     description: Retrieves all transactions for the authenticated user
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [deposit, transfer, credit]
 *                       amount:
 *                         type: number
 *                       status:
 *                         type: string
 *                         enum: [pending, success, failed]
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { user, error } = await authenticate(request);

    if (!user || error) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 401,
          message: error || 'Authentication required',
        },
        { status: 401 }
      );
    }

    if (user.type === 'service' && !hasPermission(user, 'read')) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 403,
          message: 'API key does not have read permission',
        },
        { status: 403 }
      );
    }

    const transactions = await Transaction.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .select('type amount status reference recipientWalletNumber senderWalletNumber createdAt')
      .lean();

    const formattedTransactions = transactions.map((tx) => ({
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      reference: tx.reference,
      recipientWalletNumber: tx.recipientWalletNumber,
      senderWalletNumber: tx.senderWalletNumber,
      date: tx.createdAt,
    }));

    return NextResponse.json({
      status: 'success',
      statusCode: 200,
      data: formattedTransactions,
    });
  } catch (error) {
    console.error('Get Transactions Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        statusCode: 500,
        message: 'Failed to retrieve transactions',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
