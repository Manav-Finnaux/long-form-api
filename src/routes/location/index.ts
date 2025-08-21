import { db } from "@/db";
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

export { app as location };
