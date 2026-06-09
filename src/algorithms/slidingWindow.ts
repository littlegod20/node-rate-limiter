import client from "../store/redisStore";

export const slidingWindow = async (
    key: string,
    limit: number,
    windowSecs: number,
): Promise<{allowed:boolean, remaining:number}>=>{
    const redisKey = `slw:${key}`
    const now = Date.now()

    // remove old timestamps outside window
    await client.ZREMRANGEBYSCORE(redisKey, '-inf', (now - (windowSecs * 1000)))
    
    // count what is left
    let count = await client.ZCARD(redisKey)
    
    const allowed = count < limit
    if (allowed){
        // add sorted list
        await client.ZADD(redisKey, {value: `${now}-${Math.random()}`, score:now})
        count = count + 1
        // reset the time window on redis key after windowSecs expire
        await client.expire(redisKey, windowSecs)
    }
 
    return {allowed, remaining: Math.max(0, limit - count)}
}