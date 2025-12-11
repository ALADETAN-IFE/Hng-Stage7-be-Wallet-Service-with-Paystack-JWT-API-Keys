import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Transaction, Wallet } from '@/models';
import crypto from 'crypto';

/**
 * @swagger
 * /api/wallet/paystack/webhook:
 *   post:
 *     tags:
 *       - Paystack
 *     summary: Paystack webhook handler
 *     description: Receives payment confirmations from Paystack and credits wallets (MANDATORY)
 *     parameters:
 *       - in: header
 *         name: x-paystack-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Paystack signature for verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 *       400:
 *         description: Missing signature
 *       401:
 *         description: Invalid signature
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const paystackSignature = request.headers.get('x-paystack-signature');
    const body = await request.text();
    console.log("webhook received", body);

    if (!paystackSignature) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'Missing Paystack signature',
        },
        { status: 400 }
      );
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== paystackSignature) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 401,
          message: 'Invalid signature',
        },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    console.log("webhook event details", event)

    if (event.event === 'charge.success') {
      const { reference, status, amount } = event.data;

      const transaction = await Transaction.findOne({ reference });

      if (!transaction) {
        console.error(`Transaction not found for reference: ${reference}`);
        return NextResponse.json({ status: true, statusCode: 200 }, { status: 200 });
      }

      if (transaction.status === 'success') {
        console.log(`Transaction ${reference} already processed`);
        return NextResponse.json({ status: true, statusCode: 200 }, { status: 200 });
      }

      const amountInNaira = amount / 100;
      if (amountInNaira !== transaction.amount) {
        console.error(`Amount mismatch for ${reference}`);
        transaction.status = 'failed';
        await transaction.save();
        return NextResponse.json({ status: true, statusCode: 200 }, { status: 200 });
      }

      transaction.status = status === 'success' ? 'success' : 'failed';

      if (status === 'success') {
        const wallet = await Wallet.findById(transaction.walletId);

        if (wallet) {
          wallet.balance += transaction.amount;
          await wallet.save();
          await transaction.save();

          console.log(
            `Wallet ${wallet.walletNumber} credited with ${transaction.amount}. New balance: ${wallet.balance}`
          );
        } else {
          console.error(`Wallet not found for transaction: ${reference}`);
          transaction.status = 'failed';
          await transaction.save();
        }
      } else {
        await transaction.save();
      }
    }

    return NextResponse.json({ status: true, statusCode: 200 }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json(
      {
        status: true,
        statusCode: 200,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}
