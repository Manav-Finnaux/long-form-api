import { db } from "@/db"
import { applicationConfigsTable } from "@/db/schemas/application-config"
import { APPLICATION_STATUS_VALUES } from "@/db/schemas/enums"
import { longFormTable } from "@/db/schemas/long-form"
import { shortFormTable } from "@/db/schemas/short-form"
import ApiError from "@/lib/error-handler"
import yup from "@/lib/yup"
import { yupValidator } from "@/lib/yup/validator"
import { verifyAuthorizationHeader } from "@/middlewares"
import { differenceInDays } from "date-fns"
import { and, desc, eq, gte, lte, or, SQLWrapper } from "drizzle-orm"
import { Hono } from "hono"
import HttpStatus from "http-status"
import {
  longFormSchema
} from "./schema"





const app = new Hono()
  .post("/", yupValidator("json", longFormSchema), async (c) => {
    const data = c.req.valid("json")

    const { aadharNo, panNo, mobileNo } = data
    const [[applicationConfigs], existingRows] = await Promise.all([
      db.select().from(applicationConfigsTable),

      db.select({ createdAt: longFormTable.createdAt, status: longFormTable.status }).from(longFormTable).where(
        or(eq(longFormTable.aadharNo, aadharNo), eq(longFormTable.panNo, panNo)),
      ).orderBy(desc(longFormTable.createdAt)).limit(1)
    ]
    )

    if (existingRows.length > 0) {
      const { status, createdAt } = existingRows[0]

      if (status === "PENDING" || status === "HOLD") {
        throw new ApiError(400, "Your Application is currently in pending state")
      }

      if (status === "IN_PROGRESS" || (status === "COMPLETED" && !applicationConfigs.allowApplicationCreationOnCompleted)) {
        throw new ApiError(400, "Your Application is already in progress")
      }

      if (status === "REJECTED" && differenceInDays(new Date(), createdAt) < applicationConfigs.applicationRejectedDays) {
        throw new ApiError(400, `Your Application was rejected in last ${applicationConfigs.applicationRejectedDays} days please try after ${applicationConfigs.applicationRejectedDays} days`)
      }
    }

    await db.transaction(async (tx) => {
      await tx.update(shortFormTable).set({ status: "PROCESSED" }).where(and(
        eq(shortFormTable.isActive, true),
        eq(shortFormTable.phoneNumber, mobileNo),
        eq(shortFormTable.status, "PENDING"),
      ))

      await tx.insert(longFormTable).values({
        ...data,
      }).returning({ id: longFormTable.id })
    })


    return c.json({ message: "Application submitted successfully", })
  })
  .use(verifyAuthorizationHeader)
  .get("/",
    yupValidator("query", yup.object({
      from: yup.string().notRequired().trim().datetime(),
      to: yup.string().notRequired().trim().datetime(),
      status: yup.string().notRequired().oneOf(APPLICATION_STATUS_VALUES)
    })), async (c) => {
      const { from, to, status } = c.req.valid("query")

      const filters: SQLWrapper[] = []

      if (from) {
        filters.push(gte(longFormTable.createdAt, from))
      }
      if (to) {
        filters.push(lte(longFormTable.createdAt, to))
      }

      if (status) {
        filters.push(eq(longFormTable.status, status))
      }

      const result = await db
        .select()
        .from(longFormTable)
        .where(
          and(
            ...filters
          )

        )
        .orderBy(desc(longFormTable.createdAt))


      return c.json({ message: "Data fetched successfully!", data: result }, HttpStatus.OK)

    })
  .put("/:id",
    yupValidator("param", yup.object({ id: yup.number().required() })),
    yupValidator("json", yup.object({
      employeeId: yup.string().notRequired().trim(),
      employeeName: yup.string().notRequired().trim(),
      loanNo: yup.string().notRequired().trim(),
      applicationNo: yup.string().notRequired().trim(),
      status: yup.string().optional().oneOf(APPLICATION_STATUS_VALUES),
      reason: yup.string().notRequired().trim(),
    }))
    , async (c) => {
      const { id } = c.req.valid("param")
      const data = c.req.valid("json")
      await db
        .update(longFormTable)
        .set(data)
        .where(eq(longFormTable.id, id))

      return c.json({ message: "Application Updated", data: null }, HttpStatus.OK)
    })


export { app as longForm }
