import { OAuth2Client } from 'google-auth-library';
import { createUser, createSocialUser, findUserByEmail, verifyPassword, generateToken } from '../models/auth.model.js';
import { env } from '../config/envConfig.js';

const GOOGLE_OAUTH_REDIRECT = env.googleRedirectUri;
const FACEBOOK_OAUTH_REDIRECT = `${env.backendOrigin.replace(/\/$/, '')}/api/auth/oauth/facebook/callback`;

function safeClientOrigin(candidate) {
  const fallback = env.clientOrigin.replace(/\/$/, '');
  if (!candidate) return fallback;

  try {
    const url = new URL(candidate);
    const origin = url.origin;
    const allowed = new Set(
      [env.clientOrigin, env.corsOrigin]
        .flatMap((value) => String(value || '').split(','))
        .map((value) => value.trim().replace(/\/$/, ''))
        .filter(Boolean),
    );
    const localDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (localDev || allowed.has(origin)) return origin;
  } catch {
    return fallback;
  }

  return fallback;
}

function encodeOAuthState(provider, returnTo) {
  return Buffer.from(JSON.stringify({
    provider,
    returnTo: safeClientOrigin(returnTo),
  })).toString('base64url');
}

function decodeOAuthState(state) {
  try {
    const parsed = JSON.parse(Buffer.from(String(state || ''), 'base64url').toString('utf8'));
    return {
      provider: parsed.provider || null,
      returnTo: safeClientOrigin(parsed.returnTo),
    };
  } catch {
    return { provider: null, returnTo: safeClientOrigin(null) };
  }
}

function redirectToClient(res, token, returnTo) {
  const target = `${safeClientOrigin(returnTo)}/?auth_token=${encodeURIComponent(token)}`;
  return res.redirect(target);
}

async function findOrCreateSocialUser({ name, email, photo }) {
  const existing = await findUserByEmail(email);
  if (existing) return existing;
  return createSocialUser({ name, email, photo });
}

async function register(req, res, next) {
  try {
    const { name, email, password, photo } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered.' });
      return;
    }

    const user = await createUser({ name, email, password, photo });
    const token = generateToken(user);

    res.status(201).json({ success: true, data: { token, user } });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const passwordValid = await verifyPassword(user, password);
    if (!passwordValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    const { password_hash, ...userData } = user;
    res.json({ success: true, data: { token, user: userData } });
  } catch (error) {
    next(error);
  }
}

async function googleRedirect(req, res, next) {
  try {
    if (!env.googleClientId || !env.googleClientSecret) {
      return res.status(500).json({ success: false, message: 'Google OAuth is not configured.' });
    }

    const client = new OAuth2Client({
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
      redirectUri: GOOGLE_OAUTH_REDIRECT,
    });

    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'select_account',
      scope: ['openid', 'email', 'profile'],
      state: encodeOAuthState('google', req.query.return_to),
    });

    res.redirect(authUrl);
  } catch (error) {
    next(error);
  }
}

async function googleCallback(req, res, next) {
  try {
    if (!env.googleClientId || !env.googleClientSecret) {
      return res.status(500).json({ success: false, message: 'Google OAuth is not configured.' });
    }

    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Missing Google authorization code.' });
    }

    const client = new OAuth2Client({
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
      redirectUri: GOOGLE_OAUTH_REDIRECT,
    });

    const { tokens } = await client.getToken({ code });
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: env.googleClientId });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Unable to verify Google profile.' });
    }

    const user = await findOrCreateSocialUser({
      name: payload.name || 'WealthFlow User',
      email: payload.email,
      photo: payload.picture || null,
    });

    const token = generateToken(user);
    const { returnTo } = decodeOAuthState(req.query.state);
    return redirectToClient(res, token, returnTo);
  } catch (error) {
    console.error('Google OAuth callback failed:', error.message);
    next(error);
  }
}

async function facebookRedirect(req, res, next) {
  try {
    if (!env.facebookAppId || !env.facebookAppSecret) {
      return res.status(500).json({ success: false, message: 'Facebook OAuth is not configured.' });
    }

    const redirectUri = FACEBOOK_OAUTH_REDIRECT;
    const authUrl = new URL('https://www.facebook.com/v17.0/dialog/oauth');
    authUrl.searchParams.set('client_id', env.facebookAppId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', encodeOAuthState('facebook', req.query.return_to));
    authUrl.searchParams.set('scope', 'email,public_profile');

    res.redirect(authUrl.toString());
  } catch (error) {
    next(error);
  }
}

async function facebookCallback(req, res, next) {
  try {
    if (!env.facebookAppId || !env.facebookAppSecret) {
      return res.status(500).json({ success: false, message: 'Facebook OAuth is not configured.' });
    }

    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Missing Facebook authorization code.' });
    }

    const accessTokenUrl = new URL('https://graph.facebook.com/v17.0/oauth/access_token');
    accessTokenUrl.searchParams.set('client_id', env.facebookAppId);
    accessTokenUrl.searchParams.set('redirect_uri', FACEBOOK_OAUTH_REDIRECT);
    accessTokenUrl.searchParams.set('client_secret', env.facebookAppSecret);
    accessTokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(accessTokenUrl.toString());
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || tokenData.error) {
      const message = tokenData.error?.message || 'Unable to fetch Facebook access token.';
      return res.status(400).json({ success: false, message });
    }

    const profileUrl = new URL('https://graph.facebook.com/me');
    profileUrl.searchParams.set('fields', 'id,name,email,picture.width(320).height(320)');
    profileUrl.searchParams.set('access_token', tokenData.access_token);

    const profileResponse = await fetch(profileUrl.toString());
    const profileData = await profileResponse.json();
    if (!profileResponse.ok || profileData.error) {
      const message = profileData.error?.message || 'Unable to fetch Facebook profile.';
      return res.status(400).json({ success: false, message });
    }

    if (!profileData.email) {
      return res.status(400).json({ success: false, message: 'Facebook account did not provide an email address.' });
    }

    const user = await findOrCreateSocialUser({
      name: profileData.name || 'WealthFlow User',
      email: profileData.email,
      photo: profileData.picture?.data?.url || null,
    });

    const token = generateToken(user);
    const { returnTo } = decodeOAuthState(req.query.state);
    return redirectToClient(res, token, returnTo);
  } catch (error) {
    next(error);
  }
}

export { register, login, googleRedirect, googleCallback, facebookRedirect, facebookCallback };
