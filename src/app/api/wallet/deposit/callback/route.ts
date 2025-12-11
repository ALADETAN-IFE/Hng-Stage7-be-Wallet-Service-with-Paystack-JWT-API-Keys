import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Transaction, Wallet } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams, origin } = new URL(request.url);
    const reference = searchParams.get('reference');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin || 'http://localhost:3000';

    if (!reference) {
      return NextResponse.redirect(
        `${appUrl}?error=missing_reference`,
        { status: 302 }
      );
    }

    const transaction = await Transaction.findOne({ reference, type: 'deposit' });

    if (!transaction) {
      return NextResponse.redirect(
        `${appUrl}?error=transaction_not_found`,
        { status: 302 }
      );
    }

    if (transaction.status === 'success') {
      return NextResponse.redirect(
        `${appUrl}?status=success&reference=${reference}`,
        { status: 302 }
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
        const paystackStatus = paystackData.data.status;
        const paystackAmount = paystackData.data.amount / 100;

        if (paystackStatus === 'success' && paystackAmount === transaction.amount) {
          const wallet = await Wallet.findById(transaction.walletId);

          if (wallet) {
            wallet.balance += transaction.amount;
            await wallet.save();

            transaction.status = 'success';
            await transaction.save();

            console.log(
              `Callback: Wallet ${wallet.walletNumber} credited with ${transaction.amount}. New balance: ${wallet.balance}`
            );

            return NextResponse.redirect(
              `${appUrl}?status=success&reference=${reference}&amount=${transaction.amount}`,
              { status: 302 }
            );
          }
        } else if (paystackStatus === 'failed' || paystackStatus === 'abandoned') {
          transaction.status = 'failed';
          await transaction.save();

          console.log(`Callback: Transaction ${reference} marked as failed (${paystackStatus})`);

          return NextResponse.redirect(
            `${appUrl}?status=failed&reference=${reference}`,
            { status: 302 }
          );
        }
      }
    } catch (verifyError) {
      console.error('Paystack verification error in callback:', verifyError);
    }

    return NextResponse.redirect(
      `${appUrl}?status=pending&reference=${reference}`,
      { status: 302 }
    );
  } catch (error) {
    console.error('Deposit Callback Error:', error);
    const { origin } = new URL(request.url);
    const fallbackUrl = process.env.NEXT_PUBLIC_APP_URL || origin || 'http://localhost:3000';
    return NextResponse.redirect(
      `${fallbackUrl}?error=callback_failed`,
      { status: 302 }
    );
  }
}
