import { Hono } from "hono"
import { steps } from "./steps"
import { verification } from "./verification"

const app = new Hono()

app.route('step', steps)
app.route('verification', verification)


export { app as longForm }
