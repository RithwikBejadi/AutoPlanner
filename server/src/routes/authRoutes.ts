import { Router, type Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { PrismaUserRepository } from "../repositories/index.js";
import prisma from "../database/prisma.js";
import { signToken, getCookieOptions } from "../utils/auth.js";
import {
  authenticate,
  optionalAuth,
  type AuthRequest,
} from "../middleware/auth.js";

const router = Router();
const userRepository = new PrismaUserRepository(prisma);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("Google OAuth client credentials are not configured");
}

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

const stripTrailingSlash = (url: string): string => url.replace(/\/$/, "");

const isLocalUrl = (value: string): boolean =>
  /localhost|127\.0\.0\.1/i.test(value);

const getConfiguredOrigins = (): string[] =>
  (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const getRequestBaseUrl = (req: AuthRequest): string => {
  const forwardedProtoHeader = req.headers["x-forwarded-proto"];
  const forwardedHostHeader = req.headers["x-forwarded-host"];

  const forwardedProto = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : forwardedProtoHeader;
  const forwardedHost = Array.isArray(forwardedHostHeader)
    ? forwardedHostHeader[0]
    : forwardedHostHeader;

  const rawProtocol = forwardedProto || req.protocol || "http";
  const rawHost = forwardedHost || req.get("host") || "";

  const protocol =
    rawProtocol
      .split(",")
      .map((part) => part.trim())
      .find(Boolean) || "http";
  const host =
    rawHost
      .split(",")
      .map((part) => part.trim())
      .find(Boolean) || "";

  if (!host) return "";
  return `${protocol}://${host}`;
};

const getGoogleRedirectUri = (req: AuthRequest): string => {
  const configuredRedirect = process.env.GOOGLE_REDIRECT_URI?.trim();
  const requestBaseUrl = getRequestBaseUrl(req);
  const isProduction = process.env.NODE_ENV === "production";

  if (configuredRedirect) {
    if (isProduction && isLocalUrl(configuredRedirect) && requestBaseUrl) {
      return `${stripTrailingSlash(requestBaseUrl)}/api/auth/google/callback`;
    }
    return configuredRedirect;
  }

  if (requestBaseUrl) {
    return `${stripTrailingSlash(requestBaseUrl)}/api/auth/google/callback`;
  }

  return "http://localhost:4000/api/auth/google/callback";
};

const getFrontendUrl = (): string => {
  const isProduction = process.env.NODE_ENV === "production";
  const explicitFrontendUrl = process.env.FRONTEND_URL?.trim();
  const configuredOrigins = getConfiguredOrigins();

  const candidates = [
    ...(explicitFrontendUrl ? [explicitFrontendUrl] : []),
    ...configuredOrigins,
  ];

  if (isProduction) {
    const nonLocalCandidate = candidates.find(
      (candidate) => !isLocalUrl(candidate),
    );
    if (nonLocalCandidate) return stripTrailingSlash(nonLocalCandidate);
  }

  const firstCandidate = candidates[0];
  if (firstCandidate) {
    return stripTrailingSlash(firstCandidate);
  }

  return "http://localhost:3000";
};

router.get("/google", (req: AuthRequest, res: Response) => {
  const redirectUri = getGoogleRedirectUri(req);
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
    redirect_uri: redirectUri,
  });

  res.redirect(authorizeUrl);
});

router.get("/google/callback", async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        error: "Bad Request",
        message: "Authorization code is required",
      });
    }

    const redirectUri = getGoogleRedirectUri(req);
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: redirectUri,
    });
    oauth2Client.setCredentials(tokens);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Google user data",
      });
    }

    let user = await userRepository.findByGoogleId(payload.sub);

    if (!user) {
      user = await userRepository.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
        picture: payload.picture || undefined,
      });
    } else {
      user = await userRepository.update(user.id, {
        name: payload.name || user.name,
        picture: payload.picture || undefined,
        email: payload.email,
      });
    }

    const token = signToken(user);
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("auth_token", token, getCookieOptions(isProd));

    const frontendUrl = getFrontendUrl();
    res.redirect(frontendUrl);
  } catch (error) {
    console.error("OAuth callback error:", error);
    import("fs").then((fs) =>
      fs.appendFileSync(
        "auth-error.log",
        "\n" +
          new Date().toISOString() +
          ": " +
          (error instanceof Error ? error.stack : String(error)),
      ),
    );
    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}/?error=auth_failed`);
  }
});

router.get("/me", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(200).json(null);
    }

    const user = await userRepository.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found",
      });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve user",
    });
  }
});

router.post("/logout", (req: AuthRequest, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const { maxAge: _maxAge, ...cookieOptions } = getCookieOptions(isProd);
  res.clearCookie("auth_token", cookieOptions);

  res.json({ message: "Logged out successfully" });
});

export { router as authRouter };
