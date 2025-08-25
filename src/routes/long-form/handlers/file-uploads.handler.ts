import { db } from "@/db"
import { longFormTable } from "@/db/schemas/long-form"
import { env } from "@/env"
import ApiError from "@/lib/error-handler"
import { Logger } from "@/lib/logger"
import yup from "@/lib/yup"
import { yupValidator } from "@/lib/yup/validator"
import { fileTypeParamSchema, fileUploadSchema } from "@/routes/long-form/schema"
import { fifo, storeFile } from "@/utils"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { jwt } from "hono/jwt"
import HttpStatus from "http-status"

const app = new Hono()
const fileHandlerLogger = new Logger('FileHandler')

app.post(
  "/salarySlips",
  jwt({
    secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
    cookie: env.COOKIE_NAME
  }),
  yupValidator("form", yup.object({
    'file[]': yup.mixed()
  })),
  async (c) => {
    const body = await c.req.parseBody();
    const files = body['files[]']
    const filesArray = Array.isArray(files) ? files : [files];
    const id = c.get("jwtPayload").id;

    try {
      let filePaths: string[] = [];

      for (let file of filesArray) {
        const { filePath } = await storeFile(file, id, 'salarySlips');
        filePaths.push(filePath);
      }

      await db.transaction(async (tx) => {
        let filePathsArray = [...filePaths];

        const [{ existingSalarySlips }] = await tx
          .select({ existingSalarySlips: longFormTable.salarySlips })
          .from(longFormTable)
          .where(eq(longFormTable.id, id))

        if (Array.isArray(existingSalarySlips)) {
          filePathsArray = fifo(existingSalarySlips, filePaths)
        }

        await tx
          .update(longFormTable)
          .set({
            salarySlips: filePathsArray
          })
          .where(eq(longFormTable.id, id))
      })
    }
    catch (e: any) {
      fileHandlerLogger.error(`salarySlips api error ${e.message ?? ''}`)
    }

    return c.json({ message: "File saved successfully" }, HttpStatus.OK)
  }
)

app.post(
  "/:fileType",
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
      const { filePath } = await storeFile(file, id, fileType)

      // await db.transaction(async (tx) => {
      let filePathToStore: string[] | string = filePath;

      await db
        .update(longFormTable)
        .set({
          [fileType]: filePathToStore
        })
        .where(eq(longFormTable.id, id))
      // })
    }
    catch (e: any) {
      fileHandlerLogger.error(e.message ?? 'file saving error')
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong')
    }

    return c.json({ message: "File saved successfully" }, HttpStatus.OK)
  }
)

export { app as fileUploads }