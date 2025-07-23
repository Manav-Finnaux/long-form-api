import "dotenv/config";

import ApiError from "@/lib/error-handler";
import { serve } from "@hono/node-server";
import { getConnInfo } from "@hono/node-server/conninfo";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import httpStatus from "http-status";
import { env } from "./env";
import { finnaux } from "./routes/finnaux";
import { location } from "./routes/location";
import { longForm } from "./routes/long-form";
import { transporter } from "./utils";
import { renderConfirmationEmail } from "./verification-service/email-template";

const app = new Hono();
const PORT = env.PORT;

env.NODE_ENV === "development" && app.use(logger());

app.use(
  cors({
    //we need this so that we serve dynamic origins without the nagging of browser
    origin: (origin, c) => {
      return origin;
    },
    credentials: true,
  })
);

app.use(
  rateLimiter({
    handler: (c) => c.json({ message: httpStatus[429], data: null }, 429),
    windowMs: 60 * 1000, // 1 minute
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    keyGenerator: (c) => {
      return getConnInfo(c).remote.address!;
    },
  })
);

app.use('/public/*', serveStatic({ root: './' }))

app.get("/", (c) => {
  return c.json({ message: "Hello from server!", data: null });
});

app.get("/test-email", async (c) => {
  const confirmationEmailTemplateHtml = await renderConfirmationEmail("Manav")

  await transporter.sendMail({
    from: `Northwestern Finance <${env.EMAIL_ID}>`,
    to: "manavsharmaskr02@gmail.com",
    subject: 'Review in progress',
    html: confirmationEmailTemplateHtml
  })

  return c.json({ msg: "OK" }, 200)
})

app
  .basePath("/api")
  .route("/long-form", longForm)
  .route("/location", location)
  .route("/finnaux", finnaux);

app.onError((err, c) => {
  console.log({ err });
  if (err instanceof ApiError) {
    return c.json({ message: err.message, data: null }, err.statusCode);
  }

  if (err instanceof HTTPException) {
    return c.json({ message: err.message, data: null }, err.status);
  }
  return c.json(
    { message: "Internal Server Error", data: null },
    httpStatus.INTERNAL_SERVER_ERROR
  );
});

app.notFound((c) => {
  return c.json({ message: httpStatus[404], data: null }, httpStatus.NOT_FOUND);
});

console.log(`Server is running on http://localhost:${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT,
});
