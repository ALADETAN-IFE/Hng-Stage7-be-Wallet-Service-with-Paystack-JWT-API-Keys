import { NextResponse } from 'next/server';
import { oauth2Client, scopes } from '@/lib/googleAuth';

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get Google OAuth URL
 *     description: Returns the Google OAuth authorization URL for user sign-in
 *     responses:
 *       200:
 *         description: Google OAuth URL returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 authorization_url:
 *                   type: string
 *                   example: https://accounts.google.com/o/oauth2/v2/auth?...
 *                 message:
 *                   type: string
 *                   example: Redirect to this URL to start Google Sign-in.
 */

export async function GET() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
  });

  return NextResponse.json({
    status: 'success',
    statusCode: 200,
    authorization_url: authUrl,
    message: 'Redirect to this URL to start Google Sign-in.',
  });
}