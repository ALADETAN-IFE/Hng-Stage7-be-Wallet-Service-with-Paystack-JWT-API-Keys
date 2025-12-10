import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Transaction } from '@/models';

/**
 * @swagger
 * /api/wallet/deposit/{reference}/status:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Check deposit status
 *     description: Checks the status of a deposit transaction (does NOT credit wallet)
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction reference
 *     responses:
 *       200:
 *         description: Status retrieved successfully
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
 *                     status:
 *                       type: string
 *                       enum: [pending, success, failed]
 *                     amount:
 *                       type: number
 *       404:
 *         description: Transaction not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    await connectDB();

    const { reference } = await params;

    const transaction = await Transaction.findOne({
      reference,
      type: "deposit",
    });

    if (!transaction) {
      return NextResponse.json(
        {
          status: "error",
          statusCode: 404,
          message: "Transaction not found",
        },
        { status: 404 }
      );
    }

    try {
      const paystackResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const paystackData = await paystackResponse.json();

      if (paystackData.status && paystackData.data) {
        return NextResponse.json({
          status: "success",
          statusCode: 200,
          data: {
            reference: transaction.reference,
            status: transaction.status,
            amount: transaction.amount,
            paystackStatus: paystackData.data.status,
            message: "Wallet will be credited via webhook",
          },
        });
      }
    } catch (paystackError) {
      console.error("Paystack verification error:", paystackError);
    }

    return NextResponse.json({
      status: "success",
      statusCode: 200,
      data: {
        reference: transaction.reference,
        status: transaction.status,
        amount: transaction.amount,
      },
    });
  } catch (error) {
    console.error("Deposit Status Error:", error);
    return NextResponse.json(
      {
        status: "error",
        statusCode: 500,
        message: "Failed to retrieve deposit status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
