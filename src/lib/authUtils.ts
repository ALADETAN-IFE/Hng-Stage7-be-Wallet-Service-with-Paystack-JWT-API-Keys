import jwt from 'jsonwebtoken';
import { User, Wallet } from '@/models';
import { connectDB } from './db';
import { generateUniqueWalletNumber } from './walletUtils';

export async function findOrCreateUser(googleId: string, email: string, name: string) {
  await connectDB();

  let user = await User.findOne({ googleId });

  if (!user) {
    user = await User.create({ googleId, email, name });
    
    const walletNumber = await generateUniqueWalletNumber();
    const wallet = await Wallet.create({ 
      userId: user._id,
      walletNumber,
      balance: 0 
    });

    return { 
      id: user._id.toString(),
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      walletId: wallet._id.toString(), 
      walletNumber: wallet.walletNumber 
    };
  } else {

    const wallet = await Wallet.findOne({ userId: user._id });
    
    if (!wallet) {
      const walletNumber = await generateUniqueWalletNumber();
      const newWallet = await Wallet.create({ 
        userId: user._id,
        walletNumber,
        balance: 0 
      });
      
      return {
        id: user._id.toString(),
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        walletId: newWallet._id.toString(),
        walletNumber: newWallet.walletNumber
      };
    }
    
    return { 
      id: user._id.toString(),
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      walletId: wallet._id.toString(), 
      walletNumber: wallet.walletNumber 
    };
  }
}

export function generateAuthToken(userId: string, walletId: string, walletNumber: string): string {
  const payload = {
    userId,
    walletId,
    walletNumber,
    type: 'user',
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, secret, { expiresIn: '1h' });
}