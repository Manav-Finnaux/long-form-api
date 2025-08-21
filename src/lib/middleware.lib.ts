import { env } from "@/env";
import ApiError from "@/lib/error-handler";
import { createMiddleware } from "hono/factory";

export const verifyAuthorizationHeader = createMiddleware(async (c, next) => {
    const authorizationHeader = c.req.header("Authorization");

    if (authorizationHeader !== env.API_AUTHORIZATION_HEADER_SECRET) {
        throw new ApiError(401, "Unauthorized");
    }
    await next()
})