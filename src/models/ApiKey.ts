import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApiKey extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  key: string;
  permissions: ('read' | 'deposit' | 'transfer')[];
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    key: { 
        type: String, 
        required: true, 
        unique: true 
    },
    permissions: [{ 
        type: String, 
        enum: ['read', 'deposit', 'transfer'] 
    }],
    expiresAt: { 
        type: Date, 
        required: true 
    },
    isRevoked: { 
        type: Boolean, 
        default: false 
    },
  },
  { timestamps: true }
);

ApiKeySchema.index({ key: 1, isRevoked: 1, expiresAt: 1 });

export const ApiKey: Model<IApiKey> = mongoose.models.ApiKey || mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
