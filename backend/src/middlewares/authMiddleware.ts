import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/apiResponse";
import { IUserPayload } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, 401, "Access token missing or malformed");
      return;
    }
    const token = authHeader.split(' ')[1]
    if (!token) {
      sendError(res, 401, 'Access token missing');
      return;
    }
    const decoded = verifyAccessToken(token)
    req.user = decoded

    next() 
    
  } catch (error) {
    if(error instanceof Error){
      if(error.name === "TokenExpiredError"){
        sendError(res, 401, "Access token expired");
        return
      }
      if (error.name === 'JsonWebTokenError') {
        sendError(res, 401, 'Invalid access token');
        return;
      }
    }
    sendError(res, 401, 'Authentication failed');
  }
};

// ─── Role-based guard (used after protect)
export const restrictTo = (...roles: Array<'user' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if(!req.user || !roles.includes(req.user.role)){
      sendError(res, 403, "You do not have permission to perform this action");
      return
    }
    next()
  }
}
