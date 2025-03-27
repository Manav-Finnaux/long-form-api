
import 'dotenv/config';
import * as yup from "yup";

const envSchema = yup.object({
    NODE_ENV: yup.string().oneOf(["development", "production"]).default("development"),
    PORT: yup.number().required().default(4000),
    DATABASE_URL: yup.string().trim().required(),
    ANONYMOUS_CUSTOMER_JWT_SECRET: yup.string().trim().required(),
    ENCRYPTION_KEY: yup.string().trim().required(),
    API_AUTHORIZATION_HEADER_SECRET: yup.string().trim().required(),
    CORS_LIST: yup.string().required().trim()
})

//For node js and bun js runtime
export const env = envSchema.validateSync(process.env, {
    stripUnknown: true
});

