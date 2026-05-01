import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { REFRESH_COOKIE_OPTIONS } from "../utils/jwt";
import { IRegisterInput, ILoginInput } from "../types";

export const register = async (
  req: Request<object, object, IRegisterInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { authResponse, refreshToken } = await authService.registerUser(
      req.body,
    );
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(res, 201, "Account created successfully", authResponse);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<object, object, ILoginInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { authResponse, refreshToken } = await authService.loginUser(
      req.body,
    );
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(res, 200, "Login successfully", authResponse);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const incomingToken = req.cookies?.refreshToken as string | undefined;

    if (!incomingToken) {
      sendError(res, 401, "No refresh token provided");
      return;
    }

    const {
      authResponse: { accessToken },
      refreshToken: newRefreshToken,
    } = await authService.refreshAccessToken(incomingToken);

    res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(res, 200, "Token refreshed", { accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const incomingToken = req.cookies?.refreshToken as string | undefined;

    if (incomingToken) {
      const userId = req.user?.userId;
      if (userId) {
        await authService.logoutUser(userId);
      }
    }
    res.clearCookie("refreshToken", {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: 0,
    });
    sendSuccess(res, 200, "Logged out successfully", null);
  } catch (error) {
    next(error);
  }
};
