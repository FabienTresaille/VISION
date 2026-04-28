export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("🚀 Vision instrumentation: Starting background services...");
    const { startCronJobs } = await import("./lib/cron");
    startCronJobs();
  }
}
