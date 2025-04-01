import { db } from "@/db"
import { longFormTable } from "@/db/schemas/long-form"
import { env } from "@/env"
import ApiError from "@/lib/error-handler"
import { Regex } from "@/lib/regex"
import yup from "@/lib/yup"
import { yupValidator } from "@/lib/yup/validator"
import { saveOtp, sendOtp, verifyOtp } from "@/services"
import { generateOtp } from "@/utils"
import { and, eq } from "drizzle-orm"
import { Hono } from "hono"
import { deleteCookie, setCookie } from "hono/cookie"
import { jwt, sign } from "hono/jwt"


const COOKIE_NAME = "track_loan_session"

const app = new Hono()
  .post("/verify-application", yupValidator("json",
    yup.object(
      {
        mobileNo: yup.string().required().matches(Regex.PHONE_NUMBER),
        applicationNo: yup.string().required(),
      }
    )), async (c) => {
      const data = c.req.valid("json")

      const { applicationNo, mobileNo } = data

      const [row] = await db.select().from(longFormTable).where(
        and(
          eq(longFormTable.applicationNo, applicationNo),
          eq(longFormTable.mobileNo, mobileNo),
          eq(longFormTable.status, "COMPLETED")

        ))

      if (!row) {
        throw new ApiError(400, "Application not found")
      }


      const otp = generateOtp()
      await sendOtp(mobileNo, otp)
      await saveOtp(mobileNo, otp, new Date(Date.now() + 5 * 60 * 1000))


      const jwt = await sign(
        { id: row.id },
        env.ANONYMOUS_CUSTOMER_JWT_SECRET,
      )

      setCookie(c, COOKIE_NAME, jwt, {
        secure: true,
        httpOnly: true,
        sameSite: "lax",
      })

      return c.json({ message: "OTP sent, please verify mobile number first" })
    })

  .post("/get-application-data", jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: COOKIE_NAME,
  },), yupValidator("json",
    yup.object(
      {
        otp: yup.string().required(),
        type: yup.string().required().oneOf(["STATEMENT", "CLOSURE"]),
      }
    )), async (c) => {
      const data = c.req.valid("json")
      const { id } = c.get("jwtPayload");
      const [row] = await db.select().from(longFormTable).where(
        eq(longFormTable.id, id)
      )

      if (!row) {
        throw new ApiError(400, "Application not found")
      }
      await verifyOtp(data.otp, row.mobileNo)
      deleteCookie(c, COOKIE_NAME)

      return c.json({ message: "Data fetched successfully!", data: "Cat is the secret of my energy" })
    })


export { app as trackLoan }
