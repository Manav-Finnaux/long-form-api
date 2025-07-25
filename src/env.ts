import * as yup from "yup";

const envSchema = yup.object({
    NODE_ENV: yup.string().oneOf(["development", "production"]).default("development"),
    PORT: yup.number().required().default(4000),
    DATABASE_URL: yup.string().trim().required(),
    ANONYMOUS_CUSTOMER_JWT_SECRET: yup.string().trim().required(),
    ENCRYPTION_KEY: yup.string().trim().required(),
    API_AUTHORIZATION_HEADER_SECRET: yup.string().trim().required(),
    // FINNAUX_AUTHORIZATION_HEADER_SECRET: yup.string().trim().required(),
    // FINNAUX_APPLICATION_STATEMENT_URL: yup.string().trim().required().url(),
    // FINNAUX_APPLICATION_CLOSURE_URL: yup.string().trim().required().url(),
    COOKIE_NAME: yup.string().trim().required(),
    SERVER_URL: yup.string().required(),
    // UI_URL: yup.string().required(),

    EMAIL_ID: yup.string().email().required(),
    EMAIL_REGION: yup.string().required(),
    AWS_SES_SECRET_ACCESS_KEY: yup.string().required(),
    AWS_SES_ACCESS_KEY_ID: yup.string().required(),

    // GMAIL_ID: yup.string().email().required(),
    // GOOGLE_APP_PASSWORD: yup.string().required(),
})

//For node js and bun js runtime
export const env = envSchema.validateSync(process.env, {
    stripUnknown: true
});

