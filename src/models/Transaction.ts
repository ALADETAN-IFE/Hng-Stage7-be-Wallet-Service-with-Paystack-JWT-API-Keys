import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  type: 'deposit' | 'transfer' | 'credit';
  amount: number;
  status: 'pending' | 'success' | 'failed';
  reference?: string;
  recipientWalletNumber?: string;
  senderWalletNumber?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { 
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true 
    },
    walletId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Wallet', 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['deposit', 'transfer', 'credit'], 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed'], 
        default: 'pending' 
    },
    reference: { 
        type: String, 
        unique: true,
        sparse: true 
    },
    recipientWalletNumber: { 
        type: String,
        required: true 
    },
    senderWalletNumber: { 
        type: String 
    },
    metadata: { 
        type: Schema.Types.Mixed 
    },
  },
  { timestamps: true }
);

export const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
