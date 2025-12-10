import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Transaction, Wallet } from '@/models';
import mongoose from 'mongoose';

/**
 * @swagger
 * /api/wallet/transfer:
 *   post:
 *     tags:
 *       - Wallet
 *     summary: Transfer funds
 *     description: Transfers funds from user's wallet to another wallet
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
 *               - wallet_number
 *               - amount
 *             properties:
 *               wallet_number:
 *                 type: string
 *                 example: "4566678954356"
 *               amount:
 *                 type: number
 *                 example: 3000
 *     responses:
 *       200:
 *         description: Transfer completed successfully
 *       400:
 *         description: Insufficient balance or invalid request
 *       404:
 *         description: Recipient wallet not found
 */
export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  
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

    if (user.type === 'service' && !hasPermission(user, 'transfer')) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 403,
          message: 'API key does not have transfer permission',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { wallet_number, amount } = body;

    if (!wallet_number || !amount) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'wallet_number and amount are required',
        },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'Amount must be a positive number',
        },
        { status: 400 }
      );
    }

    session.startTransaction();

    const senderWallet = await Wallet.findById(user.walletId).session(session);

    if (!senderWallet) {
      await session.abortTransaction();
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 404,
          message: 'Sender wallet not found',
        },
        { status: 404 }
      );
    }

    if (senderWallet.walletNumber === wallet_number) {
      await session.abortTransaction();
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'Cannot transfer to your own wallet',
        },
        { status: 400 }
      );
    }

    if (senderWallet.balance < amount) {
      await session.abortTransaction();
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'Insufficient balance',
        },
        { status: 400 }
      );
    }

    const recipientWallet = await Wallet.findOne({ walletNumber: wallet_number }).session(session);

    if (!recipientWallet) {
      await session.abortTransaction();
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 404,
          message: 'Recipient wallet not found',
        },
        { status: 404 }
      );
    }

    senderWallet.balance -= amount;
    await senderWallet.save({ session });

    recipientWallet.balance += amount;
    await recipientWallet.save({ session });

    await Transaction.create([{
      userId: user.userId,
      walletId: user.walletId,
      type: 'transfer',
      amount: -amount,
      status: 'success',
      recipientWalletNumber: wallet_number,
      senderWalletNumber: senderWallet.walletNumber,
    }], { session });

    await Transaction.create([{
      userId: recipientWallet.userId,
      walletId: recipientWallet._id,
      type: 'credit',
      amount: amount,
      status: 'success',
      senderWalletNumber: senderWallet.walletNumber,
      recipientWalletNumber: wallet_number,
    }], { session });

    await session.commitTransaction();

    return NextResponse.json({
      status: 'success',
      statusCode: 200,
      message: 'Transfer completed',
      data: {
        amount,
        recipientWalletNumber: wallet_number,
        newBalance: senderWallet.balance,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Transfer Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        statusCode: 500,
        message: 'Transfer failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
