import { db } from "@/db";
import { APPLICATION_STATUS_VALUES } from "@/db/schemas/enums";
import { longFormTable } from "@/db/schemas/long-form";
import { locationTable } from "@/db/schemas/pincodes";
import ApiError from "@/lib/error-handler";
import yup from "@/lib/yup";
import { yupValidator } from "@/lib/yup/validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import HttpStatus from "http-status";

const app = new Hono()
  .get(
    "/pincode/:pincode",
    yupValidator(
      "param",
      yup.object({
        pincode: yup.string().trim().length(6).required(),
      })
    ),
    async (c) => {
      const { pincode } = c.req.valid("param");

      const rows = await db
        .select({
          name: locationTable.name,
          block: locationTable.block,
          state: locationTable.state,
          district: locationTable.district,
          tehsil: locationTable.tehsil,
        })
        .from(locationTable)
        .where(eq(locationTable.pincode, pincode));

      if (rows.length === 0) {
        throw new ApiError(404, "Pincode not found");
      }

      return c.json(
        { message: "Data fetched successfully!", data: { rows } },
        HttpStatus.OK
      );
    }
  )
  .put(
    "/:id",
    yupValidator("param", yup.object({ id: yup.number().required() })),
    yupValidator(
      "json",
      yup.object({
        employeeId: yup.string().notRequired().trim(),
        employeeName: yup.string().notRequired().trim(),
        loanNo: yup.string().notRequired().trim(),
        applicationNo: yup.string().notRequired().trim(),
        status: yup.string().optional().oneOf(APPLICATION_STATUS_VALUES),
        reason: yup.string().notRequired().trim(),
      })
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const data = c.req.valid("json");
      await db.update(longFormTable).set(data).where(eq(longFormTable.id, id));

      return c.json(
        { message: "Application Updated", data: null },
        HttpStatus.OK
      );
    }
  );

export { app as location };
