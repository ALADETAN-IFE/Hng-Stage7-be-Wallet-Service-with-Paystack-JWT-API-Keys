import mongoose, { Schema, Document, Model } from 'mongoose';
import { generateUniqueWalletNumber } from '@/lib/walletUtils';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  walletNumber: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
         unique: true 
    },
    walletNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    balance: { 
        type: Number, 
        default: 0, 
        min: 0 
    },
  },
  { timestamps: true }
);

WalletSchema.pre('save', async function (this: IWallet) {
  if (this.isNew && !this.walletNumber) {
    this.walletNumber = await generateUniqueWalletNumber();
  }
});

export const Wallet: Model<IWallet> = mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);
