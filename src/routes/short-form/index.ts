import { db } from "@/db"
import { ENQUIRY_STATUS_VALUES } from "@/db/schemas/enums"
import { shortFormTable } from "@/db/schemas/short-form"
import { env } from "@/env"
import yup from "@/lib/yup"
import { yupValidator } from "@/lib/yup/validator"
import { verifyAuthorizationHeader } from "@/middlewares"
import {
  saveBasicInfoService,
  sendMobileOtpService,
  updateBasicInfoService,
  verifyMobileOtpService
} from "@/routes/short-form/services"
import { and, desc, eq, gte, lte, SQLWrapper } from "drizzle-orm"
import { Hono } from "hono"
import { rateLimiter } from "hono-rate-limiter"
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
    const decoded = await verify(jwt, env.ANONYMOUS_CUSTOMER_JWT_SECRET!)

    c.set("id", decoded.id)
  } catch (error) {
    return c.json(
      { message: HttpStatus[401], data: null },
      HttpStatus.UNAUTHORIZED,
    )
  }
  await next()
})


type Variables = {
  id: string
}

const app = new Hono<{
  Variables: Variables,
}>()
  .post("/", yupValidator("json", basicInfoSchema), async (c) => {
    const existingSession = getCookie(c, COOKIE_NAME)

    let existingUserId = null;
    if (existingSession) {
      try {
        const decoded = await verify(existingSession, env.ANONYMOUS_CUSTOMER_JWT_SECRET)
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
        env.ANONYMOUS_CUSTOMER_JWT_SECRET,
      )

      setCookie(c, COOKIE_NAME, jwt, {
        secure: false,
        httpOnly: true,
        sameSite: "lax",
      })
    }

    return c.json(result, HttpStatus.OK)
  })
  //all the routes below this middleware will have access to the id
  .put("/send-otp",
    verifyJwt,
    rateLimiter<{
      Variables: Variables,
    }>({
      handler: (c) => c.json({ message: HttpStatus[429], data: null }, 429),
      windowMs: 1000 * 60,
      limit: 5,
      standardHeaders: "draft-6",
      keyGenerator: (c) => {
        return "long-form-" + c.get("id")
      },
    }),
    async (c) => {
      const id = c.get("id")
      const result = await sendMobileOtpService(id)
      return c.json(result, HttpStatus.OK)
    })
  .put("/verify-otp", verifyJwt,
    yupValidator("json", verifyPhoneOtpSchema),
    async (c) => {
      const data = c.req.valid("json")
      const id = c.get("id")
      const result = await verifyMobileOtpService(id, data)
      return c.json(result, HttpStatus.OK)
    },
  )
  //put behind auth middleware
  .use(verifyAuthorizationHeader)
  .get("/",
    verifyAuthorizationHeader,
    yupValidator("query", yup.object({
      from: yup.string().notRequired().trim().datetime(),
      to: yup.string().notRequired().trim().datetime(),
      status: yup.string().notRequired().oneOf(ENQUIRY_STATUS_VALUES)
    })), async (c) => {
      const { from, to, status } = c.req.valid("query")

      const filters: SQLWrapper[] = []

      if (from) {
        filters.push(gte(shortFormTable.createdAt, from))
      }
      if (to) {
        filters.push(lte(shortFormTable.createdAt, to))
      }

      if (status) {
        filters.push(eq(shortFormTable.status, status))
      }


      const result = await db
        .select()
        .from(shortFormTable)
        .where(
          and(
            eq(shortFormTable.isActive, true),
            ...filters
          )

        )
        .orderBy(desc(shortFormTable.createdAt))


      return c.json({ message: "Data fetched successfully!", data: result }, HttpStatus.OK)

    })
  .put("/:id",
    yupValidator("param", yup.object({ id: yup.number().required() })),
    yupValidator("json", yup.object({
      remarks: yup.string().notRequired().trim(),
      employeeName: yup.string().required().trim(),
      status: yup.string().required().oneOf(ENQUIRY_STATUS_VALUES)
    }))
    , async (c) => {
      const { id } = c.req.valid("param")
      const data = c.req.valid("json")
      const result = await updateBasicInfoService(id, data)

      return c.json(result, HttpStatus.OK)
    })


export { app as shortForm }
