import { Router, type Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { PrismaUserRepository } from '../repositories/index.js';
import prisma from '../database/prisma.js';
import { signToken, getCookieOptions } from '../utils/auth.js';
import { authenticate, optionalAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();
const userRepository = new PrismaUserRepository(prisma);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  throw new Error('Google OAuth environment variables are not configured');
}

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

const getFrontendUrl = (): string => {
  const explicitFrontendUrl = process.env.FRONTEND_URL?.trim();
  if (explicitFrontendUrl) {
    return explicitFrontendUrl.replace(/\/$/, '');
  }

  const configuredOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return (configuredOrigins[0] || 'http://localhost:3000').replace(/\/$/, '');
};

router.get('/google', (req: AuthRequest, res: Response) => {
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'consent'
  });

  res.redirect(authorizeUrl);
});

router.get('/google/callback', async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Authorization code is required'
      });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid Google user data'
      });
    }

    let user = await userRepository.findByGoogleId(payload.sub);

    if (!user) {
      user = await userRepository.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
        picture: payload.picture || undefined
      });
    } else {
      user = await userRepository.update(user.id, {
        name: payload.name || user.name,
        picture: payload.picture || undefined,
        email: payload.email
      });
    }

    const token = signToken(user);
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('auth_token', token, getCookieOptions(isProd));

    const frontendUrl = getFrontendUrl();
    res.redirect(frontendUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    import('fs').then(fs => fs.appendFileSync('auth-error.log', '\n' + new Date().toISOString() + ': ' + (error instanceof Error ? error.stack : String(error))));
    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
});

router.get('/me', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(200).json(null);
    }

    const user = await userRepository.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user'
    });
  }
});

router.post('/logout', (req: AuthRequest, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  res.json({ message: 'Logged out successfully' });
});

export { router as authRouter };
