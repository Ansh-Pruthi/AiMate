import {Response, Request, NextFunction} from "express"
import { sendError } from "../utils/apiResponse"

export interface AppError extends Error {
    statusCode: number,
    isOperational?: boolean
}

export const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
) : void => {
    const statusCode = err.statusCode || 500
    const message = err.isOperational ? err.message : 'Internal Server Error' 

    if(process.env.NODE_ENV === 'development') {
        console.error("Error: ", {
            message: err.message,
            stack: err.stack,
            statusCode
        })
    }
    else{
        if(statusCode >= 500){
            console.error("Server Error: ", err.message)
        }
    }
    sendError(res, statusCode, message)
}


export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
    const error: AppError = new Error(`Route not found: ${req.originalUrl}`) as AppError
    error.statusCode = 404
    error.isOperational = true
    next(error)
}