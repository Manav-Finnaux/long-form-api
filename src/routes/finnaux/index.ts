import { db } from "@/db";
import { longFormTable, LongFormTableType } from "@/db/schemas/long-form";
import { yupValidator } from "@/lib/yup/validator";
import { filePathArrayToBase64, filePathToBase64 } from "@/utils";
import { and, eq, gte, lte } from "drizzle-orm";
import { Hono } from "hono";
import HttpStatus from "http-status";
import { getLongFormData, getLongFormDataType, putLongFormData, putLongFormDataType } from "./schema";

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
  "/",
  yupValidator("query", getLongFormData),
  async (c) => {
    const query: getLongFormDataType = c.req.valid("query");

    const data: any[] = await db
      .select()
      .from(longFormTable)
      .where(
        and(
          lte(longFormTable.createdAt, new Date(query.to).toISOString()),
          gte(longFormTable.createdAt, new Date(query.from).toISOString()),
          eq(longFormTable.isFullyFilled, true)
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
      .update(longFormTable)
      .set(payload)
      .where(eq(longFormTable.id, id))
      .returning()

    return c.json({ msg: "Data updated", updatedData }, HttpStatus.OK)
  }
)
export { app as finnaux };
