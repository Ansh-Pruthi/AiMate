import { User, IUser } from "../models/User";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import {
  IRegisterInput,
  ILoginInput,
  ITokenPair,
  IUserPayload,
  IAuthResponse,
} from "../types";

export class AuthError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

const createTokenPair = (user: IUser): ITokenPair => {
  const payload: IUserPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const registerUser = async (
  input: IRegisterInput,
): Promise<{ authResponse: IAuthResponse; refreshToken: string }> => {
  const { name, email, password } = input;

  // 1. Check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AuthError("An account with this email already exists", 409);
  }

  // 2. Create user
  const user = await User.create({ name, email, password });

  // 3. Generate tokens
  const { accessToken, refreshToken } = createTokenPair(user);
  // 4. Store hashed refresh token in DB
  //    Never store raw tokens — treat them like passwords
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    authResponse: {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    },
    refreshToken,
  };
};

export const loginUser = async (
  input: ILoginInput,
): Promise<{ authResponse: IAuthResponse; refreshToken: string }> => {
  const { email, password } = input;

  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user) {
    throw new AuthError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AuthError("Account is deactivated. Please contact support.", 403);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AuthError("Invalid email or password", 401);
  }

  const { accessToken, refreshToken } = createTokenPair(user);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return {
    authResponse: {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    },
    refreshToken,
  };
};

export const refreshAccessToken = async (
  incomingRefreshToken: string,
): Promise<{ authResponse: IAuthResponse; refreshToken: string }> => {
  let decoded: IUserPayload;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw new AuthError("Invalid refresh token", 401);
  }

  const user = await User.findById(decoded.userId).select("+refreshToken");
  if (!user || user.refreshToken !== incomingRefreshToken) {
    // Token reuse detected — someone may have stolen a token
    // Invalidate ALL sessions for this user
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }
    throw new AuthError(
      "Refresh token reuse detected. Please login again.",
      401,
    );
  }

  const { accessToken, refreshToken } = createTokenPair(user);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    authResponse: {
      accessToken,
      user
    },
    refreshToken,
  };
};

export const logoutUser = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(
    userId,
    { refreshToken: null },
    { new: true }
  );
};