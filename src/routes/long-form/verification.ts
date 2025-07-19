import { env } from "@/env"
import ApiError from "@/lib/error-handler"
import { yupValidator } from "@/lib/yup/validator"
import { Hono } from "hono"
import { rateLimiter } from "hono-rate-limiter"
import { jwt } from "hono/jwt"
import HttpStatus from "http-status"
import { getEmailOtpSchema, verifyTokenSchema } from "./schema"
import { saveEmailService, sendEmailOtpService, sendMobileOtpService, verifyEmailOtpService, verifyMobileOtpService } from "./services"

// the cookie was added in create-cookie route
// all the routes below will have access to the id

const app = new Hono()

// request phone otp
app.put(
  "/phone-otp",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME,
  }),
  rateLimiter({
    handler: (c) => c.json({ message: HttpStatus[429], data: null }, 429),
    windowMs: 1000 * 60,
    limit: 5,
    standardHeaders: "draft-6",
    keyGenerator: (c) => {
      return "long-form-phone-" + c.get("jwtPayload").id;
    },
  }),
  async (c) => {
    const id = c.get("jwtPayload").id;
    const result = await sendMobileOtpService(id);

    return c.json(result, HttpStatus.OK);
  }
)

// verify phone otp
app.put(
  "/verify-phone",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME,
  }),
  yupValidator("json", verifyTokenSchema),
  async (c) => {
    const data = c.req.valid("json");
    const id = c.get("jwtPayload").id;
    const result = await verifyMobileOtpService(id, data);

    return c.json(result, HttpStatus.OK);
  }
)

// request email otp
app.put(
  "/email-otp",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME
  }),
  rateLimiter({
    handler: (c) => c.json({ message: HttpStatus[429], data: null }, 429),
    windowMs: 1000 * 60,
    limit: 5,
    standardHeaders: "draft-6",
    keyGenerator: (c) => {
      return "long-form-email-" + c.get("jwtPayload").id;
    },
  }),
  yupValidator("json", getEmailOtpSchema),
  async (c) => {
    const { email, isPersonal } = c.req.valid("json")
    const id = c.get("jwtPayload").id

    // this function will also check internally that mobileNo is verified
    const { data } = await saveEmailService({ id, email, isPersonal })

    if (!data.sendOtp) {
      throw new ApiError(500, "Something went wrong!")
    }

    return c.json(await sendEmailOtpService(id, isPersonal), HttpStatus.OK)
  }
)

// verify email otp
app.put(
  "/verify-email",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME
  }),
  yupValidator("json", verifyTokenSchema),
  async (c) => {
    const { otp, isPersonal } = c.req.valid("json")
    const id = c.get("jwtPayload").id

    return c.json(await verifyEmailOtpService({ id, otp, isPersonal }), HttpStatus.OK)
  }
)

export { app as verification }
