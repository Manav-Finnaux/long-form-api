import { env } from "@/env"
import ApiError from "@/lib/error-handler"
import { yupValidator } from "@/lib/yup/validator"
import { Hono } from "hono"
import { rateLimiter } from "hono-rate-limiter"
import { jwt } from "hono/jwt"
import HttpStatus from "http-status"
import { getEmailOtpSchema, verifyDocumentNoSchema, verifyDocumentNoSchemaType, verifyTokenSchema } from "./schema"
import { saveEmailService, sendEmailOtpService, sendMobileOtpService, verifyEmailOtpService, verifyMobileOtpService } from "./services"
import { db } from "@/db"
import { longFormTable } from "@/db/schemas/long-form"
import { and, eq, ne, or } from "drizzle-orm"

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

app.get(
  "/can-proceed",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME
  }),
  yupValidator("query", verifyDocumentNoSchema),
  async (c) => {
    const { type, value }: verifyDocumentNoSchemaType = c.req.valid("query");

    const canProceed = await db.transaction(async (tx) => {
      const applications = await tx
        .select({
          aadhaarNo: longFormTable.aadhaarNo,
          panNo: longFormTable.panNo,
          updatedAt: longFormTable.updatedAt,
          status: longFormTable.status
        })
        .from(longFormTable)
        .where(and(eq(longFormTable[type], value), eq(longFormTable.isFullyFilled, true)));

      // if there are no applications, then application can proceed as its a new one
      if (applications.length === 0) return true;

      function hasValidStatus(array: typeof applications) {
        // original function
        // const f2 = (arr) => arr.some(({status}) => status === "PENDING" || status === "IN_PROGRESS" || status === "COMPLETED" || status === "HOLD")
        const invalidValues = new Set(["PENDING", "IN_PROGRESS", "COMPLETED", "HOLD"]);
        return array.some(({ status }) => invalidValues.has(status!))
      }
      if (hasValidStatus(applications)) return false;

      // if status is CLOSED or REJECTED, then, 
      // for status === CLOSED, reject if application was closed before 7 days from now
      // for status === REJECTED, reject if application was closed before 30 days from now
      const closedApplications = applications.filter(({ status }) => status === "CLOSED")
      const rejectedApplications = applications.filter(({ status }) => status === "REJECTED")
      const now = new Date();
      const sevenDaysBeforeNow = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const ninetyDaysBeforeNow = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      // * new Date(updatedAt) > sevenDaysBeforeNow checks whether the update happened after that — i.e., within the last 7 days.
      const isClosedInvalid = closedApplications.some(({ updatedAt }) => new Date(updatedAt!) > sevenDaysBeforeNow)
      const isRejectedInvalid = rejectedApplications.some(({ updatedAt }) => new Date(updatedAt!) > ninetyDaysBeforeNow)

      if (isClosedInvalid || isRejectedInvalid) return false;

      // All checks have passed
      return true;
    })

    return c.json({ canProceed }, canProceed ? HttpStatus.OK : HttpStatus.CONFLICT)
  }
)

export { app as verification }