import { generateOtp, saveToken, sendMobileOtp, verifyToken } from "@/utils"
import { longFormTable } from "@/db/schemas/long-form"
import ApiError from "@/lib/error-handler"
import { db } from "@/db"

import { eq } from "drizzle-orm"

export async function sendMobileOtpService(id: string) {
  const [row] = await db
    .select({ mobileNo: longFormTable.mobileNo })
    .from(longFormTable)
    .where(eq(longFormTable.id, id))

  if (!row?.mobileNo) {
    throw new ApiError(404, "User not found")
  }

  const otp = generateOtp()
  await sendMobileOtp(row.mobileNo, otp)
  await saveToken(row.mobileNo, otp, new Date(Date.now() + 5 * 60 * 1000)) // 5 minutes

  return { message: "OTP Sent!", data: null }
}

export async function verifyMobileOtpService(id: any, data: any) {
  const [row] = await db
    .select({ mobileNo: longFormTable.mobileNo })
    .from(longFormTable)
    .where(eq(longFormTable.id, id))

  await verifyToken(data.otp as string, row.mobileNo as string)
  await db
    .update(longFormTable)
    .set({ isMobileOtpVerified: true })
    .where(eq(longFormTable.id, id))

  return { message: "OTP verified", data: { verificationSuccessful: true } }
}