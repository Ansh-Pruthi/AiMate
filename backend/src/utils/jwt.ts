import jwt from "jsonwebtoken";
import { IUserPayload } from "../types";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export const generateAccessToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: "AiMate",
    audience: "AiMate-client",
  });
};

export const generateRefreshToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: "AiMate",
    audience: "AiMate-client",
  });
};

export const verifyAccessToken = (token: string): IUserPayload => {
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
    issuer: "AiMate",
    audience: "AiMate-client",
  });
  return decoded as IUserPayload;
};

export const verifyRefreshToken = (token: string): IUserPayload => {
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    issuer: "AiMate",
    audience: "AiMate-client",
  });

  return decoded as IUserPayload;
};

export const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth'
}