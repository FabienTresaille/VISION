import { startCronJobs } from "./lib/cron";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("🚀 Vision instrumentation: Starting background services...");
    startCronJobs();
  }
}
