import { db } from "@/db"
import { longFormTable } from "@/db/schemas/long-form"
import { env } from "@/env"
import ApiError from "@/lib/error-handler"
import { yupValidator } from "@/lib/yup/validator"
import { storeFile2 } from "@/utils"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import { jwt, sign, verify } from "hono/jwt"
import HttpStatus from "http-status"
import { createCookieSchema, createCookieSchemaType, fileTypeParamSchema, fileUploadSchema } from "./schema"
import { saveStep1Data, updateStep1Data } from "./services"
import { steps } from "./steps"
import { verification } from "./verification"

const app = new Hono()

app.route('step', steps)
app.route('verification', verification)

// save or update phone number and also manage cookie creation
// this should be the first request coming from UI
app.put(
  "/initiate",
  yupValidator("json", createCookieSchema),
  async (c) => {
    const existingSession = getCookie(c, env.COOKIE_NAME);
    const data: createCookieSchemaType = c.req.valid("json");

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
      result = await updateStep1Data(existingUserId, data)
    } else {
      result = await saveStep1Data(data);

      const jwt = await sign(
        { id: result.id },
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

app.post(
  "/upload/:fileType",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME,
  }),
  yupValidator("param", fileTypeParamSchema),
  yupValidator("form", fileUploadSchema),
  async (c) => {
    const file = c.req.valid("form").file as File;
    const { fileType } = c.req.valid("param")
    const id = c.get("jwtPayload").id

    try {
      const { filePath } = await storeFile2(file, id, fileType)

      await db
        .update(longFormTable)
        .set({
          [fileType]: filePath
        })
        .where(eq(longFormTable.id, id))
    }
    catch (e) {
      console.log(e)
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong')
    }

    return c.json({ message: "File saved successfully" }, HttpStatus.OK)
  }
)

export { app as longForm }
