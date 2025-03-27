import 'dotenv/config';


import ApiError from "@/lib/error-handler";
import { serve } from "@hono/node-server";
import { getConnInfo } from '@hono/node-server/conninfo';
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { cors } from 'hono/cors';
import httpStatus from "http-status";
import { env } from "./env";
import { longForm } from "./routes/long-form";
import { shortForm } from "./routes/short-form";


const app = new Hono()
const PORT = env.PORT

app.use(cors({
  origin: env.CORS_LIST.split(','),
  credentials: true,
}))

app.use(
  rateLimiter({
    handler: (c) => c.json({ message: httpStatus[429], data: null }, 429),
    windowMs: 60 * 1000, // 10 seconds
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    keyGenerator: (c) => {
      return getConnInfo(c).remote.address!
    },
  })
);

app.get("/", (c) => {
  return c.json({ message: "Hello from server!", data: null })
})

app.basePath("/api").route('/short-form', shortForm).route('/long-form', longForm)


app.onError((err, c) => {

  console.log({ err });
  if (err instanceof ApiError) {
    return c.json({ message: err.message, data: null }, err.statusCode)
  }
  return c.json(
    { message: "Internal Server Error", data: null },
    httpStatus.INTERNAL_SERVER_ERROR,
  )
})

app.notFound((c) => {
  return c.json({ message: httpStatus[404], data: null }, httpStatus.NOT_FOUND)
})


console.log(`Server is running on http://localhost:${PORT}`)

serve({
  fetch: app.fetch,
  port: PORT,
})
