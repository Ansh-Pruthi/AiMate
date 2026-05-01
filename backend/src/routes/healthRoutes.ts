import {Router, Response, Request} from "express"
import mongoose from "mongoose"
import { sendSuccess } from "../utils/apiResponse"


export const healthRouter = Router()

healthRouter.get('/', (_req: Request, res: Response): void => {
    const dbStatus = mongoose.connection.readyState
    const dbStatusMap: Record<number, string> = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting'
    }

    sendSuccess(res, 200, 'Server is healthy', {
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: dbStatusMap[dbStatus] ?? 'unknown',
        uptime: `${Math.floor(process.uptime())}s`
    })
})