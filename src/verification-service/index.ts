import { db } from "@/db";
import { tokenTable } from "@/db/schemas/token";
import { env } from "@/env";
import ApiError from "@/lib/error-handler";
import { compareHash, getHashedValue } from "@/utils";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import axios from "axios";
import { eq } from "drizzle-orm";
import nodemailer from 'nodemailer';
import { renderOtpEmail } from "./email-template";

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

export async function verifyOfficialEmail(id: string, token: string) {
  const [row] = await db.select().from(tokenTable).where(eq(tokenTable.id, id))

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

  const [magicLinkRow] = await db.delete(tokenTable).where(eq(tokenTable.id, id)).returning()
  console.log({ magicLinkRow })

  return true;
}

export async function sendMobileOtp(mobileNo: string, otp: string) {
  // extract these to .env OR even better, create a table and store it there
  const key = '9997e7329aa372c275648410a5637f64'
  const route = '1'
  const senderId = 'MSFINP'
  const sms = "{otp} is your OTP for Finnaux Login. Never disclose this OTP with anybody else. MSFIN Credit Pvt Ltd ".replace("{otp}", otp);
  const templateId = '1407170970390002027'
  const url = `http://sms.par-ken.com/api/smsapi?key=${key}&route=${route}&sender=${senderId}&number=${mobileNo}(s)&sms=${sms}&templateid=${templateId}`

  axios.get(url);
}

const sesClient = new SESv2Client({
  region: env.EMAIL_REGION,
  credentials: {
    accessKeyId: env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SES_SECRET_ACCESS_KEY
  }
})

const transporter = nodemailer.createTransport({
  SES: { sesClient, SendEmailCommand }
})

export async function sendEmailOtp(personalEmail: string, otp: string) {
  try {
    const emailHtml = await renderOtpEmail({ otp });
    const subject = `Your OTP code`;

    await transporter.sendMail({
      from: env.EMAIL_ID,
      to: personalEmail,
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