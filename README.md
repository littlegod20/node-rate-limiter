# Node Rate Limiter
A custom rate limiter built with Node.js, TypeScript, Express and Redis — demonstrating three different rate limiting algorithms and how they work under the hood.

---

## Prerequisites
- Node.js v18+
- Redis v6+

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/littlegod20/rate-limiter.git
cd rate-limiter

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start Redis (WSL)
sudo service redis-server start

# Run the server
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root directory:

```
REDIS_URL=redis://localhost:6379
```

---

## Usage

Plug the middleware into any Express route with one line:

```typescript
import { rateLimiter } from './middleware/rateLimiter'

// Fixed window — 10 requests per 60 seconds
app.get('/endpoint', rateLimiter({ strategy: 'fixed-window', limit: 10, windowSecs: 60 }), handler)

// Sliding window — 10 requests per 60 seconds
app.get('/endpoint', rateLimiter({ strategy: 'sliding-window', limit: 10, windowSecs: 60 }), handler)

// Token bucket — 10 tokens, refills over 60 seconds
app.get('/endpoint', rateLimiter({ strategy: 'token-bucket', limit: 10, windowSecs: 60 }), handler)
```

When a request is blocked, the server responds with:

```json
{
  "message": "Too many requests made. Try again later."
}
```

With status code `429`. Every response also includes these headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 4
```

---

## The Three Algorithms

### Fixed Window
This is the strategy where a limited amount of requests can be made by the user within a stipulated time frame.

**Trade-off:** A user can exploit the time bound nature and abuse the system by sending multiple requests at the boundaries of the time frames. For example, if users can make 100 requests per minute, a user can make 100 requests at 00:59 and another 100 at 1:00 — that is 200 requests in 2 seconds.

---

### Sliding Window Log
This strategy timestamps every request and cross-checks how long ago it was made. Instead of fixed buckets, the window slides forward with every request — always looking back exactly `windowSecs` from right now.

**Trade-off:** This algorithm is very effective but at the cost of memory and speed. Since every request timestamp must be stored, handling millions of requests in a time window can be slow and memory intensive.

---

### Token Bucket
A strategy where tokens are stored in a bucket and each request consumes one token. The bucket refills at a fixed rate over time. If the bucket is empty the request is blocked.

**Trade-off:** Token bucket is less precise than sliding window log but far more memory efficient. It only cares about whether tokens are available — a user can exhaust all tokens in 2 seconds and simply waits for the next refill. Only two values are stored per user regardless of request volume.

---

## Algorithm Comparison

| Algorithm | Memory Usage | Precision | Burst Handling |
|---|---|---|---|
| Fixed Window | Low | Low | Poor |
| Sliding Window Log | High | High | Good |
| Token Bucket | Low | Medium | Good |