// import { db } from "@/db";
// import { ENQUIRY_STATUS_VALUES } from "@/db/schemas/enums";
// import { shortFormTable } from "@/db/schemas/short-form";
// import { env } from "@/env";
// import yup from "@/lib/yup";
// import { yupValidator } from "@/lib/yup/validator";
// import { verifyAuthorizationHeader } from "@/middlewares";
// import {
//   saveBasicInfoService,
//   sendMobileOtpService,
//   updateBasicInfoService,
//   verifyMobileOtpService,
// } from "@/routes/short-form/services";
// import { canSendOtp } from "@/otp-service";
// import { and, desc, eq, gte, lte, SQLWrapper } from "drizzle-orm";
// import { Hono } from "hono";
// import { rateLimiter } from "hono-rate-limiter";
// import { deleteCookie, getCookie, setCookie } from "hono/cookie";
// import { jwt, sign, verify } from "hono/jwt";
// import HttpStatus from "http-status";
// import { basicInfoSchema, verifyPhoneOtpSchema } from "./schema";

// const COOKIE_NAME = "anonymous_session";

// const app = new Hono()
//   .post("/", yupValidator("json", basicInfoSchema), async (c) => {
//     const existingSession = getCookie(c, COOKIE_NAME);

//     let existingUserId = null;
//     if (existingSession) {
//       try {
//         const decoded = await verify(
//           existingSession,
//           env.ANONYMOUS_CUSTOMER_JWT_SECRET
//         );
//         existingUserId = decoded.id as string;
//       } catch (err) { }
//     }
//     let result = null;

//     if (existingUserId) {
//       result = await updateBasicInfoService(
//         existingUserId,
//         c.req.valid("json")
//       );
//     } else {
//       const data = c.req.valid("json");
//       result = await saveBasicInfoService(data);

//       const jwt = await sign(
//         { id: result.data.id },
//         env.ANONYMOUS_CUSTOMER_JWT_SECRET
//       );

//       setCookie(c, COOKIE_NAME, jwt, {
//         secure: true,
//         httpOnly: true,
//         sameSite: "none",
//         expires: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes
//       });
//     }

//     const sendOtp = await canSendOtp();

//     return c.json(
//       { ...result, data: { ...result.data, sendOtp } },
//       HttpStatus.OK
//     );
//   })
//   //all the routes below this middleware will have access to the id
//   .put(
//     "/send-otp",
//     jwt({
//       secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
//       cookie: COOKIE_NAME,
//     }),
//     rateLimiter({
//       handler: (c) => c.json({ message: HttpStatus[429], data: null }, 429),
//       windowMs: 1000 * 60,
//       limit: 5,
//       standardHeaders: "draft-6",
//       keyGenerator: (c) => {
//         return "short-form-" + c.get("jwtPayload").id;
//       },
//     }),
//     async (c) => {
//       const id = c.get("jwtPayload").id;
//       const result = await sendMobileOtpService(id);
//       return c.json(result, HttpStatus.OK);
//     }
//   )
//   .put(
//     "/verify-otp",
//     jwt({
//       secret: env.ANONYMOUS_CUSTOMER_JWT_SECRET,
//       cookie: COOKIE_NAME,
//     }),
//     yupValidator("json", verifyPhoneOtpSchema),
//     async (c) => {
//       const data = c.req.valid("json");
//       const id = c.get("jwtPayload").id;
//       const result = await verifyMobileOtpService(id, data);
//       //deleting cookie after success
//       deleteCookie(c, COOKIE_NAME, {
//         secure: true,
//         httpOnly: true,
//         sameSite: "none",
//       });
//       return c.json(result, HttpStatus.OK);
//     }
//   )
//   //put behind auth middleware
//   .use(verifyAuthorizationHeader)
//   .get(
//     "/",
//     verifyAuthorizationHeader,
//     yupValidator(
//       "query",
//       yup.object({
//         from: yup.string().notRequired().trim().datetime(),
//         to: yup.string().notRequired().trim().datetime(),
//         status: yup.string().notRequired().oneOf(ENQUIRY_STATUS_VALUES),
//       })
//     ),
//     async (c) => {
//       const { from, to, status } = c.req.valid("query");

//       const filters: SQLWrapper[] = [];

//       if (from) {
//         filters.push(gte(shortFormTable.createdAt, from));
//       }
//       if (to) {
//         filters.push(lte(shortFormTable.createdAt, to));
//       }

//       if (status) {
//         filters.push(eq(shortFormTable.status, status));
//       }

//       const result = await db
//         .select()
//         .from(shortFormTable)
//         .where(and(eq(shortFormTable.isActive, true), ...filters))
//         .orderBy(desc(shortFormTable.createdAt));

//       return c.json(
//         { message: "Data fetched successfully!", data: result },
//         HttpStatus.OK
//       );
//     }
//   )
//   .put(
//     "/:id",
//     yupValidator("param", yup.object({ id: yup.number().required() })),
//     yupValidator(
//       "json",
//       yup.object({
//         remarks: yup.string().notRequired().trim(),
//         employeeName: yup.string().notRequired().trim(),
//         employeeId: yup.string().notRequired().trim(),
//         status: yup.string().notRequired().oneOf(ENQUIRY_STATUS_VALUES),
//       })
//     ),
//     async (c) => {
//       const { id } = c.req.valid("param");
//       const data = c.req.valid("json");
//       const result = await updateBasicInfoService(id, data);

//       return c.json(result, HttpStatus.OK);
//     }
//   );

// export { app as shortForm };
