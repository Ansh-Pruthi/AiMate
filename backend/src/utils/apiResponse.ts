import {Response} from 'express'

interface SuccessResponse<T> {
    success: true,
    message: string,
    data: T
} 

interface ErrorResponse<T> {
    success: false,
    message: string,
    data: T
}

export const sendSuccess = <T>(
    res: Response,
    statusCode: number,
    message: string, 
    data: T
) : Response<SuccessResponse<T>> => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    })
}

export const sendError = <T>(
    res: Response,
    statusCode: number,
    message: string,
    errors?: string[]
) : Response<ErrorResponse<T>> => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors && {errors})
    })
}