import { db } from "@/db"
import { longFormTable } from "@/db/schemas/long-form"
import { env } from "@/env"
import ApiError from "@/lib/error-handler"
import { yupValidator } from "@/lib/yup/validator"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { jwt } from "hono/jwt"
import HttpStatus from "http-status"
import { step1Schema, step2Schema, step2Type, step3Schema, step3Type, step4Schema, step4Type, step5Schema, step5Type, step6Schema, step6Type } from "./schema"
import { sendConfirmationEmail } from "./services"
import { deleteCookie } from "hono/cookie"
import { isFullyFilled } from "@/utils"

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

    const noData = (await db
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
      .set(data)
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
    const documentsData: step3Type = c.req.valid("json")
    const id = c.get('jwtPayload').id

    // const { filePath: aadhaarBack } = await storeFile(documentsData.aadhaarBack, id)
    // const { filePath: aadhaarFront } = await storeFile(documentsData.aadhaarFront, id)
    // const { filePath: panCard } = await storeFile(documentsData.panCard, id)
    // const { filePath: profilePicture } = await storeFile(documentsData.profilePicture, id)

    // const updatedData = { ...documentsData, aadhaarBack, aadhaarFront, panCard, profilePicture }

    await db
      .update(longFormTable)
      .set(documentsData)
      .where(eq(longFormTable.id, id))

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

    // const salarySlipPaths = await Promise.all(
    //   data.salarySlips.map(async (salarySlip) => {
    //     const res = await storeFile(salarySlip as [string, string], id) // salarySlip as [base64, fileName]

    //     return res.filePath
    //   })
    // )

    await db
      .update(longFormTable)
      .set(data)
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

    // const { filePath: bankStatement } = await storeFile(data.bankStatement as [string, string], id)

    await db
      .update(longFormTable)
      .set(data)
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

    await db.transaction(async (tx) => {
      const [row] = await tx
        .update(longFormTable)
        .set(data)
        .where(eq(longFormTable.id, id))
        .returning()

      if (isFullyFilled(row)) {
        tx.update(longFormTable).set({ isFullyFilled: true }).where(eq(longFormTable.id, id))
      }
    })

    await sendConfirmationEmail(id)

    deleteCookie(c, env.COOKIE_NAME, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });

    return c.json({ message: 'Data saved successfully' }, HttpStatus.OK)
  }
)

export { app as steps }
