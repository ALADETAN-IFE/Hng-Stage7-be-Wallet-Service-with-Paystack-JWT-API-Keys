import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ApiKey } from '@/models';
import crypto from 'crypto';

/**
 * @swagger
 * /api/keys/rollover:
 *   post:
 *     tags:
 *       - API Keys
 *     summary: Rollover expired API key
 *     description: Creates a new API key using the same permissions as an expired key
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expired_key_id
 *               - expiry
 *             properties:
 *               expired_key_id:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               expiry:
 *                 type: string
 *                 enum: [1H, 1D, 1M, 1Y]
 *                 example: 1M
 *     responses:
 *       201:
 *         description: API key rolled over successfully
 *       400:
 *         description: Key not expired or max keys limit reached
 *       404:
 *         description: API key not found
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
          message: 'Only users can rollover API keys',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { expired_key_id, expiry } = body;

    if (!expired_key_id || !expiry) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'Please provide the ID of the expired API key and the new expiry duration',
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

    const expiredKey = await ApiKey.findOne({
      _id: expired_key_id,
      userId: user.userId,
    });

    if (!expiredKey) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 404,
          message: 'The specified API key was not found or does not belong to you',
        },
        { status: 404 }
      );
    }

    if (new Date() <= expiredKey.expiresAt) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'This API key is still active and has not expired yet. You can only rollover expired keys.',
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

    const newApiKey = await ApiKey.create({
      userId: user.userId,
      name: expiredKey.name,
      key: hashedKey,
      permissions: expiredKey.permissions,
      expiresAt,
    });

    return NextResponse.json({
      status: 'success',
      statusCode: 201,
      message: 'API key rolled over successfully',
      data: {
        id: newApiKey._id,
        name: newApiKey.name,
        api_key: apiKeyValue,
        permissions: newApiKey.permissions,
        expires_at: newApiKey.expiresAt,
      },
    });
  } catch (error) {
    console.error('Rollover API Key Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        statusCode: 500,
        message: 'Failed to rollover API key',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
