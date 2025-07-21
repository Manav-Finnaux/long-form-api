import { db } from "@/db";
import { longFormTable, LongFormTableType } from "@/db/schemas/long-form";
import { yupValidator } from "@/lib/yup/validator";
import { and, eq, gte, lte } from "drizzle-orm";
import { Hono } from "hono";
import HttpStatus from "http-status";
import { getLongFormData, getLongFormDataType, putLongFormData, putLongFormDataType } from "./schema";
import { finnauxData } from "@/db/schemas/finnaux";
import { filePathArrayToBase64, filePathToBase64 } from "@/utils";
import { sendConfirmationEmail } from "../long-form/services";
import { sendEmailOtp } from "@/verification-service";

type DocumentType = string[] | null

interface UpdatedLongFormType extends Omit<LongFormTableType, 'profilePicture' | 'aadhaarFront' | 'aadhaarBack' | 'panCard' | 'salarySlips' | 'employmentProofDocument' | 'bankStatement'> {
  profilePicture: DocumentType
  aadhaarFront: DocumentType
  aadhaarBack: DocumentType
  panCard: DocumentType
  salarySlips: DocumentType[] | null
  employmentProofDocument: DocumentType
  bankStatement: DocumentType
}

const app = new Hono()

app.get(
  "/test",
  async (c) => {
    await sendConfirmationEmail("63d12150-1ba0-4799-bf32-c0df783e1cff")

    return c.json({ msg: "Test route" }, HttpStatus.OK)
  }
)

app.get(
  "/",
  yupValidator("query", getLongFormData),
  async (c) => {
    const query: getLongFormDataType = c.req.valid("query");

    const data: LongFormTableType[] = await db
      .select()
      .from(longFormTable)
      .where(
        and(
          lte(longFormTable.createdAt, new Date(query.to).toISOString()),
          gte(longFormTable.createdAt, new Date(query.from).toISOString())
        )
      )

    const updatedData = await Promise.all(data.map(
      async (data) => {
        const updatedData: UpdatedLongFormType = {
          ...data,
          profilePicture: await filePathToBase64(data.profilePicture),
          aadhaarFront: await filePathToBase64(data.aadhaarFront),
          aadhaarBack: await filePathToBase64(data.aadhaarBack),
          panCard: await filePathToBase64(data.panCard),
          salarySlips: await filePathArrayToBase64(data.salarySlips),
          employmentProofDocument: await filePathToBase64(data.employmentProofDocument),
          bankStatement: await filePathToBase64(data.bankStatement),
        }

        return updatedData
      }
    ))

    return c.json({ data: updatedData }, HttpStatus.OK)
  }
)

app.put(
  "/",
  yupValidator("json", putLongFormData),
  async (c) => {
    const { id, ...payload }: putLongFormDataType = c.req.valid("json")

    const updatedData = await db
      .update(finnauxData)
      .set(payload)
      .where(eq(finnauxData.id, id))
      .returning()

    return c.json({ msg: "Data updated", updatedData }, HttpStatus.OK)
  }
)
export { app as finnaux };
