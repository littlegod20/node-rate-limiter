import client from "../store/redisStore";


export const fixedWindow = async (
    key: string,
    limit: number,
    windowSec: number
): Promise<{allowed: boolean, remaining: number}> => {
    const redisKey = `fw:${key}`;

    const count = await client.incr(redisKey);

    if (count === 1) {
        await client.expire(redisKey, windowSec)
    }

    const allowed = count <= limit;

    return {allowed, remaining: Math.max(0, limit - count)}
}