import { env } from "@/env"
import ApiError from "@/lib/error-handler"
import yup from "@/lib/yup"
import { yupValidator } from "@/lib/yup/validator"
import { Hono } from "hono"
import { rateLimiter } from "hono-rate-limiter"
import { jwt } from "hono/jwt"
import HttpStatus from "http-status"
import { step2Schema, verifyTokenSchema } from "./schema"
import { saveOfficeEmailService, savePersonalEmailService, sendEmailOtpService, sendMobileOtpService, sendOfficialMailVerificationLinkService, verifyEmailOtpService, verifyMobileOtpService, verifyOfficialEmailService } from "./services"

// the cookie was added in step 1 at steps.ts
// all the routes below will have access to the id

const app = new Hono()

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
      return "long-form-" + c.get("jwtPayload").id;
    },
  }),
  async (c) => {
    const id = c.get("jwtPayload").id;
    const result = await sendMobileOtpService(id);

    return c.json(result, HttpStatus.OK);
  }
)

app.put(
  "/verify-phone-otp",
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

app.put(
  "/email-otp",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME
  }),
  yupValidator("json", step2Schema),
  async (c) => {
    const { personalEmail } = c.req.valid("json")
    const id = c.get("jwtPayload").id
    const { data } = await savePersonalEmailService(id, personalEmail)

    if (!data.sendOtp) {
      throw new ApiError(500, "Something went wrong!")
    }

    return c.json(await sendEmailOtpService(id), HttpStatus.OK)
  }
)

app.put(
  "/verify-email-otp",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME
  }),
  yupValidator("json", verifyTokenSchema),
  async (c) => {
    const { token: otp } = c.req.valid("json")
    const id = c.get("jwtPayload").id

    return c.json(await verifyEmailOtpService(id, otp), HttpStatus.OK)
  }
)

app.put(
  "/send-office-verification-link",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME
  }),
  yupValidator("json", yup.object({
    officeEmail: yup.string().email().required()
  })),
  async (c) => {
    const { officeEmail } = c.req.valid("json")
    const id = c.get("jwtPayload").id
    const { data } = await saveOfficeEmailService(id, officeEmail)

    if (!data.sendVerificationLink) {
      throw new ApiError(500, "Something went wrong!")
    }
    return c.json(await sendOfficialMailVerificationLinkService(id), HttpStatus.OK)
  }
)

app.get(
  "/verify-office-email/:token",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME
  }),
  yupValidator("param", verifyTokenSchema),
  async (c) => {
    const { token } = c.req.valid("param")
    const id = c.get("jwtPayload").id

    const result = await verifyOfficialEmailService(id, token)
    const isVerified = result.message === 'Office email verified'

    const uiUrl = `${env.UI_URL}/verification-response/${isVerified ? 1 : 0}`
    return c.redirect(uiUrl, HttpStatus.PERMANENT_REDIRECT)
  }
)

export { app as verification }
