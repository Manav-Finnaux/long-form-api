import { db } from "@/db"
import { shortFormTable } from "@/db/schemas/short-form"
import ApiError from "@/lib/error-handler"
import { saveToken, sendMobileOtp, verifyToken, } from "@/verification-service"
import { generateOtp } from "@/utils"
import { and, eq } from "drizzle-orm"



export async function saveBasicInfoService(data: any) {

  const { rows } = await db.transaction(async (tx) => {

    await tx.update(shortFormTable).set({ isActive: false })
      .where(
        and(
          eq(shortFormTable.phoneNumber, data.phoneNumber),
          eq(shortFormTable.status, "PENDING"),
        )
      )

    const rows = await tx.insert(shortFormTable).values(data).returning({ id: shortFormTable.id })

    return { rows }
  })

  return {
    message: "User created",
    data: { id: rows[0].id },
  }
}

export async function updateBasicInfoService(id: any, data: any) {

  const row = await db.select({ phoneNumber: shortFormTable.phoneNumber, isOtpVerified: shortFormTable.isOtpVerified }).from(shortFormTable).where(eq(shortFormTable.id, id))
  await db
    .update(shortFormTable)
    .set({
      ...data,
      isOtpVerified: row[0]?.phoneNumber === data.phoneNumber ? row[0]?.isOtpVerified : false
    })
    .where(and(eq(shortFormTable.isActive, true), eq(shortFormTable.id, id)))

  return { message: "User updated", data: null }

}

export async function sendMobileOtpService(id: any) {
  const [row] = await db
    .select({ phoneNumber: shortFormTable.phoneNumber })
    .from(shortFormTable)
    .where(eq(shortFormTable.id, id))

  if (!row?.phoneNumber) {
    throw new ApiError(404, "User not found")
  }

  const otp = generateOtp()
  await sendMobileOtp(row.phoneNumber, otp)
  await saveToken(row.phoneNumber, otp, new Date(Date.now() + 5 * 60 * 1000))

  return { message: "OTP Sent!", data: null }
}


export async function verifyMobileOtpService(id: any, data: any) {
  const [row] = await db
    .select({ phoneNumber: shortFormTable.phoneNumber })
    .from(shortFormTable)
    .where(eq(shortFormTable.id, id))


  await verifyToken(data.otp, row.phoneNumber)
  await db
    .update(shortFormTable)
    .set({ isOtpVerified: true })
    .where(eq(shortFormTable.id, id))

  return { message: "OTP verified", data: null }
}

