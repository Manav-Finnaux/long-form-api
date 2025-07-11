import { Hono } from "hono"
import { steps } from "./steps"
import { verification } from "./verification"
import { jwt } from "hono/jwt"
import { env } from "@/env"
import { deleteCookie } from "hono/cookie"
import HttpStatus from "http-status"

const app = new Hono()

app.route('step', steps)
app.route('verification', verification)

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
