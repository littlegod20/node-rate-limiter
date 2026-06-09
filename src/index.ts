import express from 'express';
import { connectRedis } from './store/redisStore';
import { rateLimiter } from './middleware/rateLimiter';

const PORT = 3000

const createApp = async () => {
    const app = express();

    await connectRedis()

    app.use(express.json())

    app.post('/fixed-window', rateLimiter({strategy:'fixed-window', limit:10, windowSecs:60}), (req, res) => {
        res.json({ message: 'fixed window request successful' })
    })
    app.post('/sliding-window', rateLimiter({strategy:'sliding-window', limit:10, windowSecs:60}), (req, res) => {
        res.json({ message: 'sliding window request successful' })
    })
    app.post('/token-bucket', rateLimiter({strategy:'token-bucket', limit:10, windowSecs:60}), (req, res) => {
        res.json({ message: 'token bucket request successful' })
    })

    app.listen(PORT, ()=> {
        console.log(`Server listening on PORT: ${PORT}`)
    })
}

createApp()