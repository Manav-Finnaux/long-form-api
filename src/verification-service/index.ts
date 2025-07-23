import { db } from "@/db";
import { tokenTable } from "@/db/schemas/token";
import { env } from "@/env";
import ApiError from "@/lib/error-handler";
import { compareHash, getHashedValue, transporter } from "@/utils";
import axios from "axios";
import { eq } from "drizzle-orm";
import { renderOtpEmail } from "./email-template";
import { smsConfig } from "@/db/schemas/sms-config";

export async function saveToken(target: string, otp: string, otpExpireAt: Date) {
  const hashedOtp = await getHashedValue(otp);
  const otpExpireAtIso = new Date(otpExpireAt).toISOString();
  const rows = await db
    .insert(tokenTable)
    .values({ target, token: hashedOtp, tokenExpireAt: otpExpireAtIso })
    .onConflictDoUpdate({
      set: { token: hashedOtp, tokenExpireAt: otpExpireAtIso },
      target: tokenTable.target,
    })
    .returning({ id: tokenTable.id });

  return rows[0].id
}

export async function verifyToken(token: string, target: string) {
  const [row] = await db.select().from(tokenTable).where(eq(tokenTable.target, target));

  if (!row) {
    throw new ApiError(400, "Token not found");
  }
  if (new Date(row.tokenExpireAt) < new Date()) {
    throw new ApiError(400, "Token expired, please generate new token.");
  }

  const isValid = await compareHash(token, row.token);
  if (!isValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  await db.delete(tokenTable).where(eq(tokenTable.target, target)).returning()

  return true;
}

export async function sendMobileOtp(mobileNo: string, otp: string) {
  const [{ key, route, senderId, template, templateId }] = await db.select().from(smsConfig);

  if ([key, route, senderId, template, templateId].some(value => value == null)) {
    throw new Error('One or more required fields are null or undefined');
  }

  const sms = template!.replace("{#var#}", otp)

  const url = `http://sms.par-ken.com/api/smsapi?key=${key}&route=${route}&sender=${senderId}&number=${mobileNo}(s)&sms=${sms}&templateid=${templateId}`

  axios.get(url);
}

export async function sendEmailOtp(receiverEmailID: string, name: string, otp: string) {
  try {
    const emailHtml = await renderOtpEmail({ otp, name });
    const subject = `Verify your email`;

    await transporter.sendMail({
      from: `Northwestern Finance <${env.EMAIL_ID}>`,
      to: receiverEmailID,
      subject,
      html: emailHtml
    });

    return { message: "OTP sent" };
  }
  catch (e) {
    console.log(e);
    return { message: 'Something went wrong!' }
  }
}