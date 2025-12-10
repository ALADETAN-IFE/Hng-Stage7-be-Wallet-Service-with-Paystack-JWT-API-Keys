import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Wallet } from '@/models';

/**
 * @swagger
 * /api/wallet/balance:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Get wallet balance
 *     description: Retrieves the current wallet balance
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       example: 15000
 *                     walletNumber:
 *                       type: string
 *                       example: "4561234567890"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
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

    const wallet = await Wallet.findById(user.walletId);

    if (!wallet) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 404,
          message: 'Wallet not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      statusCode: 200,
      data: {
        balance: wallet.balance,
        walletNumber: wallet.walletNumber,
      },
    });
  } catch (error) {
    console.error('Get Balance Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        statusCode: 500,
        message: 'Failed to retrieve wallet balance',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
