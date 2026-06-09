import { NextFunction, Request, Response } from "express"
import { fixedWindow } from "../algorithms/fixedWindow"
import { slidingWindow } from "../algorithms/slidingWindow"
import { tokenBucket } from "../algorithms/tokenBucket"

type Props = {
    windowSecs: number
    limit: number
    strategy: "fixed-window" | "sliding-window" | "token-bucket"
}

export const rateLimiter = ({windowSecs, limit, strategy}: Props) => {

    return async (req:Request, res:Response, next:NextFunction) => {
        const key = req.ip ?? 'unknown'
        let fn
        switch(strategy){
            case 'fixed-window':
                fn = await fixedWindow(key, limit, windowSecs)
                break;
            case 'sliding-window':
                fn = await slidingWindow(key,limit, windowSecs )
                break;
            case 'token-bucket':
                fn = await tokenBucket(key, limit, (limit/windowSecs)/1000)
                break;
            default:
                fn = await fixedWindow(key, limit, windowSecs)
        }
        
        const {allowed ,remaining} = fn

        res.set('X-RateLimit-Remaining', `${remaining}`)
        res.set('X-RateLimit-Limit', `${limit}`)

        if (allowed){
            next()
        } else{
            res.status(429).json({message: 'Too many requests made. Try again later.'})
        }
    }
}