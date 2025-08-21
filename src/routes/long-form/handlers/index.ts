import { continueForm } from "@/routes/long-form/handlers/continue-form.handler"
import { verification } from "@/routes/long-form/handlers/verification.handler"
import { fileUploads } from "@/routes/long-form/handlers/file-uploads.handler"
import { initiate } from "@/routes/long-form/handlers/initiate.handler"
import { steps } from "@/routes/long-form/handlers/steps.handler"

import { Hono } from "hono"

const app = new Hono()

app.route('step', steps)
app.route('verification', verification)
app.route('upload', fileUploads)
app.route('initiate', initiate)
app.route('continue-form', continueForm)

export { app as longForm }
