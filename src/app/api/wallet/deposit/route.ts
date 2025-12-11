import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Transaction } from '@/models';
import crypto from 'crypto';

/**
 * @swagger
 * /api/wallet/deposit:
 *   post:
 *     tags:
 *       - Wallet
 *     summary: Initialize deposit
 *     description: Initializes a Paystack deposit transaction
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Payment initialized successfully
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
 *                   type: object
 *                   properties:
 *                     reference:
 *                       type: string
 *                     authorization_url:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
export async function POST(request: NextRequest) {
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

    if (user.type === 'service' && !hasPermission(user, 'deposit')) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 403,
          message: 'API key does not have deposit permission',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'Valid amount is required',
        },
        { status: 400 }
      );
    }

    const reference = `DEP_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    await Transaction.create({
      userId: user.userId,
      walletId: user.walletId,
      recipientWalletNumber: user.walletNumber,
      type: 'deposit',
      amount,
      status: 'pending',
      reference,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';
    const callbackUrl = `${appUrl}/api/wallet/deposit/callback?reference=${reference}`;

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `user_${user.userId}@wallet.com`, 
        amount: amount * 100,
        reference,
        callback_url: callbackUrl,
        metadata: {
          userId: user.userId,
          walletId: user.walletId,
          walletNumber: user.walletNumber,
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'Failed to initialize payment',
          error: paystackData.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: 'success',
      statusCode: 200,
      message: 'Payment initialized',
      data: {
        reference,
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
      },
    });
  } catch (error) {
    console.error('Deposit Initialization Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        statusCode: 500,
        message: 'Failed to initialize deposit',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
