import { defineApp } from "convex/server";
import resend from "@convex-dev/resend/convex.config.js";

const app = defineApp();

// Add Resend component for reliable queued email delivery
app.use(resend);

export default app;
