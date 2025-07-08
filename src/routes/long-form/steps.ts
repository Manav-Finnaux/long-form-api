import { env } from "@/env"
import { yupValidator } from "@/lib/yup/validator"
import { Hono } from "hono"
import { deleteCookie, getCookie, setCookie } from "hono/cookie"
import { jwt, sign, verify } from "hono/jwt"
import HttpStatus from "http-status"
import { step1Schema, step1Type, step2Schema, step3Schema } from "./schema"
import { saveStep1DataService, updateStep1DataService } from "./services"
import ApiError from "@/lib/error-handler"
import { db } from "@/db"
import { longFormTable } from "@/db/schemas/long-form"
import { eq } from "drizzle-orm"

const app = new Hono()

app.post("/1", yupValidator("json", step1Schema), async (c) => {
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
})

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

export { app as steps }