import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { connectDB } from './db';
import { User, Wallet, ApiKey } from '@/models';

export interface AuthUser {
  userId: string;
  walletId: string;
  walletNumber: string;
  type: 'user' | 'service';
  permissions?: string[];
}

export async function authenticate(request: NextRequest): Promise<{ user: AuthUser | null; error?: string }> {
  await connectDB();

    const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; walletId: string; walletNumber: string; type: string };   
      const user = await User.findById(decoded.userId);
      if (!user) {
        return { user: null, error: 'User not found' };
      }

      const wallet = await Wallet.findOne({ userId: user._id });
      if (!wallet) {
        return { user: null, error: 'Wallet not found' };
      }

      return {
        user: {
          userId: decoded.userId,
          walletId: wallet._id.toString(),
          walletNumber: wallet.walletNumber,
          type: 'user',
        },
      };
    } catch (error) {
        console.log(error);
      return { user: null, error: 'Invalid or expired JWT token' };
    }
  }

  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader) {
    try {
      const hashedKey = crypto.createHash('sha256').update(apiKeyHeader).digest('hex');
      const apiKey = await ApiKey.findOne({ 
        key: hashedKey,
        isRevoked: false,
      });

      if (!apiKey) {
        return { user: null, error: 'Invalid API key' };
      }

      if (new Date() > apiKey.expiresAt) {
        return { user: null, error: 'API key has expired' };
      }

      const wallet = await Wallet.findOne({ userId: apiKey.userId });
      if (!wallet) {
        return { user: null, error: 'Wallet not found' };
      }

      return {
        user: {
          userId: apiKey.userId.toString(),
          walletId: wallet._id.toString(),
          walletNumber: wallet.walletNumber,
          type: 'service',
          permissions: apiKey.permissions,
        },
      };
    } catch {
      return { user: null, error: 'API key authentication failed' };
    }
  }

  return { user: null, error: 'No authentication credentials provided' };
}

export function hasPermission(user: AuthUser, requiredPermission: string): boolean {
  if (user.type === 'user') {
    return true;
  }

  return user.permissions?.includes(requiredPermission) ?? false;
}
