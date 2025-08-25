import { db } from "@/db"
import { longFormTable } from "@/db/schemas/long-form"
import { env } from "@/env"
import { renderContinueLoanApplicationEmail } from "@/lib"
import ApiError from "@/lib/error-handler"
import { yupValidator } from "@/lib/yup/validator"
import { encryptToUrlSafe, isFullyFilled, sendMail } from "@/utils"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { deleteCookie } from "hono/cookie"
import { jwt } from "hono/jwt"
import HttpStatus from "http-status"
import { step1Schema, step2Schema, step2Type, step3Schema, step3Type, step4Schema, step4Type, step5Schema, step5Type, step6Schema, step6Type } from "../schema"
import { sendConfirmationEmail } from "../services"

const app = new Hono()

//  all the routes below will have access to the id

// called after mobileNo and personalEmail are verified
app.post(
  "/1",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME
  }),
  yupValidator("json", step1Schema),
  async (c) => {
    // const data: step1Type = c.req.valid("json")
    const id = c.get("jwtPayload").id

    await db.transaction(async (tx) => {
      const noData = (await tx
        .select({
          name: longFormTable.name,
          fatherName: longFormTable.fatherName,
          dob: longFormTable.dob,
          gender: longFormTable.gender
        })
        .from(longFormTable)
        .where(eq(longFormTable.id, id))).length === 0

      if (noData) {
        throw new ApiError(HttpStatus.NOT_FOUND, "User data not found")
      }

      await tx.update(longFormTable).set({ stepsCompleted: 1 }).where(eq(longFormTable.id, id))
    })


    return c.json({ message: "Data saved successfully" }, HttpStatus.OK)
  }
)

app.post(
  "/2",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME
  }),
  yupValidator("json", step2Schema),
  async (c) => {
    const data: step2Type = c.req.valid("json")
    const id = c.get("jwtPayload").id

    await db
      .update(longFormTable)
      .set({
        ...data,
        stepsCompleted: 2
      })
      .where(eq(longFormTable.id, id))

    return c.json({ message: "Data saved successfully" }, HttpStatus.OK)
  }
)

app.post(
  "/3",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME,
  }),
  yupValidator("json", step3Schema),
  async (c) => {
    const data: step3Type = c.req.valid("json")
    const id = c.get('jwtPayload').id

    await db.transaction(async (tx) => {
      const [row] = await tx
        .update(longFormTable)
        .set({
          ...data,
          stepsCompleted: 3
        })
        .where(eq(longFormTable.id, id))
        .returning({
          email: longFormTable.personalEmail,
          name: longFormTable.name,
          id: longFormTable.id,
          isEmailSent: longFormTable.isContinueApplicationLinkSent
        })

      if (!row.isEmailSent) {
        const token = encryptToUrlSafe(row.id)
        const continueFormUrl = `${env.UI_URL}?continue-application=${token}`;
        const continueFormMailHtml = await renderContinueLoanApplicationEmail(row.name!, continueFormUrl)
        const subject = 'Your cash advance application has been saved'
        await sendMail(row.email!, subject, continueFormMailHtml)

        await tx.update(longFormTable).set({ isContinueApplicationLinkSent: true }).where(eq(longFormTable.id, id))
      }
    })

    return c.json({ message: 'Data saved successfully' }, HttpStatus.OK)
  }
)

app.post(
  "/4",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME,
  }),
  yupValidator("json", step4Schema),
  async (c) => {
    const data: step4Type = c.req.valid("json")
    const id: string = c.get('jwtPayload').id

    await db
      .update(longFormTable)
      .set({
        ...data,
        stepsCompleted: 4
      })
      .where(eq(longFormTable.id, id))

    return c.json({ message: 'Data saved successfully' }, HttpStatus.OK)
  }
)

app.post(
  "/5",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME,
  }),
  yupValidator("json", step5Schema),
  async (c) => {
    const data: step5Type = c.req.valid('json')
    const id: string = c.get('jwtPayload').id

    await db
      .update(longFormTable)
      .set({
        ...data,
        stepsCompleted: 5
      })
      .where(eq(longFormTable.id, id))

    return c.json({ message: "Data saved successfully" }, HttpStatus.OK)
  }
)

app.post(
  "/6",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME,
  }),
  yupValidator("json", step6Schema),
  async (c) => {
    const data: step6Type = c.req.valid('json')
    const id: string = c.get('jwtPayload').id

    await db
      .update(longFormTable)
      .set({
        ...data,
        stepsCompleted: 6
      })
      .where(eq(longFormTable.id, id))
      .returning()

    return c.json({ message: 'Data saved successfully' }, HttpStatus.OK)
  }
)

app.post(
  "/7",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME
  }),
  async (c) => {
    const id = c.get("jwtPayload").id

    await db.transaction(async (tx) => {
      const [row] = await tx.select().from(longFormTable).where(eq(longFormTable.id, id))

      if (isFullyFilled(row)) {
        await tx.update(longFormTable).set({ isFullyFilled: true, stepsCompleted: 7 }).where(eq(longFormTable.id, id))
      }
    })

    await sendConfirmationEmail(id)

    deleteCookie(c, env.COOKIE_NAME, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });

    return c.json({ message: 'Data saved successfully', success: true }, HttpStatus.OK)
  }
)

export { app as steps }
