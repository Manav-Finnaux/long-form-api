import {
  saveBasicInfoService,
  sendMobileOtpService,
  updateBasicInfoService,
  verifyMobileOtpService
} from "@/app/short-form/services"
import { yupValidator } from "@/lib/yup/validator"
import { Hono } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import { createMiddleware } from "hono/factory"
import { sign, verify } from "hono/jwt"
import HttpStatus from "http-status"
import {
  basicInfoSchema,
  verifyPhoneOtpSchema
} from "./schema"


const COOKIE_NAME = "anonymous_session"

const verifyJwt = createMiddleware(async (c, next) => {
  const jwt = getCookie(c, COOKIE_NAME)
  if (!jwt) {
    return c.json(
      { message: HttpStatus[401], data: null },
      HttpStatus.UNAUTHORIZED,
    )
  }

  try {
    const decoded = await verify(jwt, process.env.ANONYMOUS_CUSTOMER_JWT_SECRET!)

    c.set("id", decoded.id)
  } catch (error) {
    return c.json(
      { message: HttpStatus[401], data: null },
      HttpStatus.UNAUTHORIZED,
    )
  }
  await next()
})

const app = new Hono<{
  Variables: {
    id: string
  }
}>()
  .post("/basic-info", yupValidator("json", basicInfoSchema), async (c) => {

    const existingSession = getCookie(c, COOKIE_NAME)

    let existingUserId = null;
    if (existingSession) {
      try {
        const decoded = await verify(existingSession, process.env.ANONYMOUS_CUSTOMER_JWT_SECRET!)
        existingUserId = decoded.id as string
      } catch (err) { }
    }
    let result = null;

    if (existingUserId) {
      result = await updateBasicInfoService(existingUserId, c.req.valid("json"))
    }

    else {
      const data = c.req.valid("json")
      result = await saveBasicInfoService(data)

      const jwt = await sign(
        { id: result.data.row.id },
        process.env.ANONYMOUS_CUSTOMER_JWT_SECRET!,
      )

      setCookie(c, COOKIE_NAME, jwt, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      })

    }

    return c.json(result, HttpStatus.OK)
  })
  //all the routes below this middleware will have access to the id
  .use(verifyJwt)
  .put("/send-otp", async (c) => {
    const id = c.get("id")
    const result = await sendMobileOtpService(id)
    return c.json(result, HttpStatus.OK)
  })
  .put(
    "/verify-otp",
    yupValidator("json", verifyPhoneOtpSchema),
    async (c) => {
      const data = c.req.valid("json")
      const id = c.get("id")
      const result = await verifyMobileOtpService(id, data)
      return c.json(result, HttpStatus.OK)
    },
  )

export { app as shortForm }
