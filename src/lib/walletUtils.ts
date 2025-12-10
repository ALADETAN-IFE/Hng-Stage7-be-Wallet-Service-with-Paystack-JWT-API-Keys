import crypto from 'crypto';
import mongoose, { Model } from 'mongoose';
import { IWallet } from '../models/Wallet';

export async function generateUniqueWalletNumber(): Promise<string> {
  const maxAttempts = 10;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const randomBytes = crypto.randomBytes(5); 
    const randomNumber = parseInt(randomBytes.toString('hex'), 16).toString().slice(0, 10);
    const walletNumber = '456' + randomNumber.padStart(10, '0');
    
    const WalletModel = mongoose.models.Wallet as Model<IWallet>;
    const exists = await WalletModel.findOne({ walletNumber });
    
    if (!exists) {
      return walletNumber;
    }
  }
  
  const timestamp = Date.now().toString().slice(-6);
  const random = crypto.randomInt(0, 9999).toString().padStart(4, '0');
  return '456' + timestamp + random;
}
