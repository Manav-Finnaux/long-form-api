import yup from "@/lib/yup"
import { yupValidator } from "@/lib/yup/validator"

import { Hono } from "hono"

const app = new Hono()

app.get(
  "/:encryptedId",
  yupValidator("param", yup.object({ encryptedId: yup.string().required() })),
  async (c) => {
    const { encryptedId } = c.req.valid("param");


    // decrypt encrypted id

    // verify if this id exists in db or not

    // if yes, create cookie from this id
    // else, return bad response

    /**
     * const jwt = await sign(
        { id: result.id },
        env.ANONYMOUS_CUSTOMER_JWT_SECRET
      );

      setCookie(c, env.COOKIE_NAME, jwt, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        expires: new Date(Date.now() + 1000 * 60 * 60), // 60 minutes
      });
     */

    // send ok!
  }
)

export { app as continueForm }

// * Before working on this API, I've to see how to manage form continuation from the step asked
// * meaning, update the API of the asked step and see how will you handle if the same API is called again
// * you shouldn't send email to the user? will the link be a one time link? don't send email to the user;
// * instead, add a column to the longFormTable, called, validTill (or something like that), and keep it null by default
// * and fill it with timestamp in the suggested step. 
// * in the rest of the APIs, see if its null, -> ignore, else, check if the request is valid ~if(validTill >= sevenDaysBeforeNow ) and then if that's true, update with current time stamp 
// * on suggested step, update the validTill field in db


// * FLOW:
// * 1. user starts filling the form and reaches the suggested step.
// * in this step, the validTill field should be updated and an email should be sent to the user
// * the user can either fill the form completely, or leave it incomplete
// * regardless of whether they leave or fill it, user will receive an email with a link to update their data

// * 2. when they click the link and come to update the form, the following will happen:
// * user will have access to all steps of the form and the pre-filled data will be available for the user to see
// * on each step, some time stamp field will be updated which will increase the validity of the link



// app.get(
//   "/test",
//   async (c) => {
//     const [{ id }] = await db.select({ id: longFormTable.id }).from(longFormTable).limit(1);

//     const KEY = 'SUPER_SECRET_KEY'

//     const cipher = Crypto.AES.encrypt(id, KEY).toString()

//     const bytes = Crypto.AES.decrypt(cipher, KEY)
//     const original = bytes.toString(Crypto.enc.Utf8)

//     console.log({ cipher, original })
//   }
// )