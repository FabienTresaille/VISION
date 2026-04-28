import { fetchAllFeeds } from "./rss";

let cronStarted = false;

export function startCronJobs() {
  if (cronStarted) return;
  cronStarted = true;

  const schedule = process.env.RSS_CRON_SCHEDULE || "0 */2 * * *";

  // Dynamic import to avoid issues with edge runtime
  import("node-cron").then((cron) => {
    cron.default.schedule(schedule, async () => {
      console.log(`[CRON] ${new Date().toISOString()} - Starting RSS ingestion...`);
      try {
        const results = await fetchAllFeeds();
        console.log(
          `[CRON] RSS ingestion complete: ${results.newArticles} new articles, ${results.taggedArticles} tagged, ${results.errors.length} errors`
        );
      } catch (error) {
        console.error("[CRON] RSS ingestion failed:", error);
      }
    });

    console.log(`[CRON] RSS ingestion scheduled: ${schedule}`);
  });
}
