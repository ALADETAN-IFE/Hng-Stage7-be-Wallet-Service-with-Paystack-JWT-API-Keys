import { NextRequest, NextResponse } from 'next/server';
import { oauth2Client } from '@/lib/googleAuth';
import { findOrCreateUser, generateAuthToken } from '@/lib/authUtils';

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Google OAuth callback
 *     description: Handles Google OAuth callback, creates/logs in user, and returns JWT token
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'Authorization code is missing',
        },
        { status: 400 }
      );
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
      return NextResponse.json(
        {
          status: 'error',
          statusCode: 400,
          message: 'Failed to retrieve user information from Google',
        },
        { status: 400 }
      );
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || email.split('@')[0];

    const user = await findOrCreateUser(googleId, email, name);

    const token = generateAuthToken(user.id, user.walletId, user.walletNumber);

    return NextResponse.json({
      status: 'success',
      statusCode: 200,
      message: 'Authentication successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          walletNumber: user.walletNumber,
        },
      },
    });
  } catch (error) {
    console.error('Google OAuth Callback Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        statusCode: 500,
        message: 'Authentication failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
