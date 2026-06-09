import client from "../store/redisStore";

export const tokenBucket = async (
    key: string,
    limit: number,
    rate: number
):Promise<{allowed:boolean, remaining:number}>=>{
    const redisKey = `tb:${key}`
    const now = Date.now()

    const raw = await client.get(redisKey)
    
    const bucket = raw ? JSON.parse(raw as string) : {"token": limit, "lastRefill": now}

    const elapsed = now - bucket.lastRefill
    const tokensToAdd = elapsed * rate // 0.001
    
    let newTokens = Math.min(limit, tokensToAdd + bucket.tokens)
    
    const allowed = newTokens >= 1;
    
    if(allowed){
        newTokens = newTokens - 1
    }
    
    await client.set(redisKey, JSON.stringify({"token":newTokens, "lastRefill": now}))

    return {allowed, remaining: newTokens}
}