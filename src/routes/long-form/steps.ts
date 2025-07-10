import { db } from "@/db"
import { longFormTable } from "@/db/schemas/long-form"
import { env } from "@/env"
import ApiError from "@/lib/error-handler"
import { yupValidator } from "@/lib/yup/validator"
import { storeFile } from "@/utils"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import { jwt, sign, verify } from "hono/jwt"
import HttpStatus from "http-status"
import { step1Schema, step1Type, step2Schema, step3Schema, step4Schema, step4Type, step5Schema, step5Type, step6Schema, step6Type, step7Schema, step7Type } from "./schema"
import { saveStep1DataService, updateStep1DataService } from "./services"

const app = new Hono()

app.post(
  "/1",
  yupValidator("json", step1Schema),
  async (c) => {
    const existingSession = getCookie(c, env.COOKIE_NAME);
    const data: step1Type = c.req.valid("json");

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
      result = await updateStep1DataService(existingUserId, data, 1)
    } else {
      result = await saveStep1DataService(data, 1);

      const jwt = await sign(
        { id: result.data.id },
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

//  all the routes below will have access to the id
app.post(
  "/2",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME,
  }),
  yupValidator("json", step2Schema),
  async (c) => {
    const data = c.req.valid("json")
    const id = c.get("jwtPayload").id
    // step 2 k data m ek field aaega "officeEmailVerificationLinkSent"
    // ye ek boolean hoga
    // agar value true h, to kuch officeEmail ko store krwa lo
    // else, do nothing

    if (data.officeEmailVerificationLinkSent) {
      if (!!data.officeEmail) {
        // store the office email in db
        await db
          .update(longFormTable)
          .set({
            officeEmail: data.officeEmail
          })
          .where(eq(longFormTable.id, id))
      }
      else {
        throw new ApiError(HttpStatus.BAD_REQUEST, 'Office email is required after requesting a verification link')
      }
    }

    return c.json(null, HttpStatus.OK)
  }
)

app.post(
  "/3",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME
  }),
  yupValidator("json", step3Schema),
  async (c) => {
    const data = c.req.valid("json")
    const id = c.get("jwtPayload").id

    await db
      .update(longFormTable)
      .set(data)
      .where(eq(longFormTable.id, id))

    return c.json({ msg: 'abc' }, HttpStatus.OK)
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
    const documentsData: step4Type = c.req.valid("json")
    const id = c.get('jwtPayload').id

    const { filePath: aadhaarBack } = await storeFile(documentsData.aadhaarBack, id)
    const { filePath: aadhaarFront } = await storeFile(documentsData.aadhaarFront, id)
    const { filePath: panCard } = await storeFile(documentsData.panCard, id)
    const { filePath: profilePicture } = await storeFile(documentsData.profilePicture, id)

    const updatedData = { ...documentsData, aadhaarBack, aadhaarFront, panCard, profilePicture }

    await db
      .update(longFormTable)
      .set(updatedData)
      .where(eq(longFormTable.id, id))

    return c.json({ message: 'Step 4 data saved successfully' }, HttpStatus.OK)
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
    const data: step5Type = c.req.valid("json")
    const id: string = c.get('jwtPayload').id

    // save salary slips
    const salarySlipPaths = await Promise.all(
      data.salarySlips.map(async (salarySlip) => {
        const res = await storeFile(salarySlip as [string, string], id) // salarySlip as [base64, fileName]

        return res.filePath
      })
    )

    await db
      .update(longFormTable)
      .set({
        ...data,
        salarySlips: salarySlipPaths
      })
      .where(eq(longFormTable.id, id))

    return c.json({ msg: 'Step 5 data saved successfully' }, HttpStatus.OK)
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

    const { filePath: bankStatement, message } = await storeFile(data.bankStatement as [string, string], id)

    await db
      .update(longFormTable)
      .set({
        ...data,
        bankStatement
      })
      .where(eq(longFormTable.id, id))

    return c.json({ msg: 'abc' }, HttpStatus.OK)
  }
)

app.post(
  "/7",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME,
  }),
  yupValidator("json", step7Schema),
  async (c) => {
    const data: step7Type = c.req.valid('json')
    const id: string = c.get('jwtPayload').id

    console.log({ loanPurpose: data.loanPurpose })

    await db
      .update(longFormTable)
      .set(data)
      .where(eq(longFormTable.id, id))

    return c.json({ message: 'Step 7 data saved successfully' }, HttpStatus.OK)
  }
)

export { app as steps }
