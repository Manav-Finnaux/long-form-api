import { db } from "@/db"
import { longFormTable } from "@/db/schemas/long-form"
import { env } from "@/env"
import { yupValidator } from "@/lib/yup/validator"
import { createCookieSchema, createCookieSchemaType } from "@/routes/long-form/schema"

import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import { sign, verify } from "hono/jwt"
import HttpStatus from "http-status"

const app = new Hono()

// save or update phone number and also manage cookie creation
// this should be the first request coming from UI
app.put(
  "/",
  yupValidator("json", createCookieSchema),
  async (c) => {
    const existingSession = getCookie(c, env.COOKIE_NAME);
    const data: createCookieSchemaType = c.req.valid("json");

    let existingUserId = null;
    if (existingSession) {
      try {
        const decoded = await verify(
          existingSession,
          env.ANONYMOUS_CUSTOMER_JWT_SECRET
        );
        console.log('existing session detected: ', decoded)
        existingUserId = decoded.id as string;
      } catch (err) { }
    }
    let result = null;

    if (existingUserId) {
      const [row] = await db
        .update(longFormTable)
        .set(data)
        .where(eq(longFormTable.id, existingUserId))
        .returning({ id: longFormTable.id })

      result = row
    } else {
      const [row] = await db.insert(longFormTable).values(data).returning({ id: longFormTable.id })
      result = row

      const jwt = await sign(
        { id: result.id },
        env.ANONYMOUS_CUSTOMER_JWT_SECRET
      );

      setCookie(c, env.COOKIE_NAME, jwt, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        expires: new Date(Date.now() + 1000 * 60 * 60), // 60 minutes
      });
    }

    return c.json(result, HttpStatus.OK);
  }
)

export { app as initiate }
