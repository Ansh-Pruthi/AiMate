import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/apiResponse";

interface ValidationError {
  field: string;
  message: string;
}

// Register validators
export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors: ValidationError[] = [];
  const { name, email, password } = req.body as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
  };
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters",
    });
  }
  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push({ field: "email", message: "Invalid email address" });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    errors.push({
      field: "password",
      message: "Password must be at least 6 characters",
    });
  }
  if (errors.length > 0) {
    sendError(
      res,
      400,
      "Validation failed",
      errors.map((e) => `${e.field}: ${e.message}`),
    );
    return;
  }
  next();
};

// Login validators
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: ValidationError[] = [];
  const { email, password } = req.body as {
    email?: unknown;
    password?: unknown;
  };

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push({ field: 'email', message: 'A valid email is required' });
  }

  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    sendError(
      res,
      422,
      'Validation failed',
      errors.map((e) => `${e.field}: ${e.message}`)
    );
    return;
  }

  next();
};