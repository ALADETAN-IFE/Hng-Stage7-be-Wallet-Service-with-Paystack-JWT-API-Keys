import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ApiKey } from '@/models';
import crypto from 'crypto';

/**
 * @swagger
 * /api/keys/create:
 *   post:
 *     tags:
 *       - API Keys
 *     summary: Create a new API key
 *     description: Creates a new API key for service-to-service authentication (JWT required)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - permissions
 *               - expiry
 *             properties:
 *               name:
 *                 type: string
 *                 example: wallet-service
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [read, deposit, transfer]
 *                 example: ["deposit", "transfer", "read"]
 *               expiry:
 *                 type: string
 *                 enum: [1H, 1D, 1M, 1Y]
 *                 example: 1D
 *     responses:
 *       201:
 *         description: API key created successfully
 *       400:
 *         description: Bad request or max keys limit reached
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only JWT users can create API keys
 */
export async function POST(request: NextRequest) {
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

    if (user.type !== 'user') {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 403,
          message: 'Only users can create API keys',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, permissions, expiry } = body;

    if (!name || !permissions || !expiry) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'name, permissions, and expiry are required',
        },
        { status: 400 }
      );
    }

    const validPermissions = ['read', 'deposit', 'transfer'];
    if (!Array.isArray(permissions) || !permissions.every((p) => validPermissions.includes(p))) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'Invalid permissions. Valid options: read, deposit, transfer',
        },
        { status: 400 }
      );
    }

    const validExpiry = ['1H', '1D', '1M', '1Y'];
    if (!validExpiry.includes(expiry)) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'Invalid expiry. Valid options: 1H, 1D, 1M, 1Y',
        },
        { status: 400 }
      );
    }

    const activeKeysCount = await ApiKey.countDocuments({
      userId: user.userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (activeKeysCount >= 5) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'Maximum of 5 active API keys allowed per user',
        },
        { status: 400 }
      );
    }

    const expiresAt = new Date();
    switch (expiry) {
      case '1H':
        expiresAt.setHours(expiresAt.getHours() + 1);
        break;
      case '1D':
        expiresAt.setDate(expiresAt.getDate() + 1);
        break;
      case '1M':
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        break;
      case '1Y':
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        break;
    }

    const apiKeyValue = `sk_live_${crypto.randomBytes(32).toString('hex')}`;
    const hashedKey = crypto.createHash('sha256').update(apiKeyValue).digest('hex');

    const apiKey = await ApiKey.create({
      userId: user.userId,
      name,
      key: hashedKey,
      permissions,
      expiresAt,
    });

    return NextResponse.json({
      status: 'success',
      statusCode: 201,
      message: 'API key created successfully',
      data: {
        id: apiKey._id,
        name: apiKey.name,
        api_key: apiKeyValue,
        permissions: apiKey.permissions,
        expires_at: apiKey.expiresAt,
      },
    });
  } catch (error) {
    console.error('Create API Key Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        statusCode: 500,
        message: 'Failed to create API key',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
