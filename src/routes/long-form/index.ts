import { Hono } from "hono"
import { steps } from "./steps"
import { verification } from "./verification"
import { jwt, sign, verify } from "hono/jwt"
import { env } from "@/env"
import { deleteCookie, getCookie, setCookie } from "hono/cookie"
import HttpStatus from "http-status"
import { yupValidator } from "@/lib/yup/validator"
import { createCookieSchema, createCookieType } from "./schema"
import { saveStep1Data, updateStep1Data } from "./services"

const app = new Hono()

app.route('step', steps)
app.route('verification', verification)

// save or update phone number and also manage cookie creation
// this should be the first request coming from UI
app.put(
  "/create-cookie",
  yupValidator("json", createCookieSchema),
  async (c) => {
    const existingSession = getCookie(c, env.COOKIE_NAME);
    const data: createCookieType = c.req.valid("json");

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
      result = await updateStep1Data(existingUserId, data)
    } else {
      result = await saveStep1Data(data);

      const jwt = await sign(
        { id: result.id },
        env.ANONYMOUS_CUSTOMER_JWT_SECRET
      );

      setCookie(c, env.COOKIE_NAME, jwt, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        expires: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes
      });
    }

    return c.json(result, HttpStatus.OK);
  }
)

app.get(
  "/delete-cookie",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME,
  }),
  async (c) => {
    deleteCookie(c, env.COOKIE_NAME, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });

    return c.json({ message: 'Ok' }, HttpStatus.OK)
  }
)


export { app as longForm }
