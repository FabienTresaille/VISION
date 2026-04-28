import Parser from "rss-parser";
import { prisma } from "./prisma";
import { analyzeArticle } from "./gemini";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Vision-Alsek/1.0 RSS Reader",
  },
});

export async function fetchAllFeeds(categoryId?: string) {
  const where: any = { active: true };
  if (categoryId) where.categoryId = categoryId;

  const feeds = await prisma.rssFeed.findMany({
    where,
    include: {
      category: {
        include: { subCategories: true },
      },
    },
  });

  const results = {
    totalFeeds: feeds.length,
    totalArticles: 0,
    newArticles: 0,
    taggedArticles: 0,
    errors: [] as string[],
  };

  // Load all categories for tagging
  const allCategories = await prisma.category.findMany({
    include: { subCategories: true },
  });

  for (const feed of feeds) {
    try {
      const parsed = await parser.parseURL(feed.url);
      results.totalArticles += parsed.items?.length || 0;

      for (const item of parsed.items || []) {
        if (!item.link) continue;

        // Check for duplicates
        const existing = await prisma.rssArticle.findUnique({
          where: { url: item.link },
        });
        if (existing) continue;

        // Create article
        const article = await prisma.rssArticle.create({
          data: {
            feedId: feed.id,
            title: item.title || "Sans titre",
            summary: item.contentSnippet || item.content || "",
            content: item.content || "",
            url: item.link,
            author: item.creator || item.author || null,
            imageUrl: extractImageUrl(item),
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          },
        });

        results.newArticles++;

        // Auto-tag with primary category from feed
        await prisma.rssArticleTag.create({
          data: {
            articleId: article.id,
            categoryId: feed.categoryId,
          },
        });

        // AI analysis & refined tagging
        try {
          const analysis = await analyzeArticle(
            article.title,
            article.summary || "",
            allCategories.map((c) => ({
              name: c.name,
              code: c.code,
              subCategories: c.subCategories.map((s) => ({
                name: s.name,
                code: s.code,
              })),
            }))
          );

          if (analysis) {
            await prisma.rssArticle.update({
              where: { id: article.id },
              data: {
                relevanceScore: analysis.relevanceScore,
                aiAnalysis: analysis.analysis,
              },
            });

            // Add refined tags from AI
            for (const cat of analysis.categories || []) {
              const category = allCategories.find((c) => c.code === cat.code);
              if (!category || category.id === feed.categoryId) continue;

              for (const subCode of cat.subCategories || []) {
                const subCat = category.subCategories.find(
                  (s) => s.code === subCode
                );
                await prisma.rssArticleTag.upsert({
                  where: {
                    articleId_categoryId_subCategoryId: {
                      articleId: article.id,
                      categoryId: category.id,
                      subCategoryId: subCat?.id || "",
                    },
                  },
                  update: {},
                  create: {
                    articleId: article.id,
                    categoryId: category.id,
                    subCategoryId: subCat?.id || null,
                  },
                });
              }
            }

            results.taggedArticles++;
          }
        } catch (aiError) {
          console.error(`AI tagging error for "${article.title}":`, aiError);
        }
      }

      // Update last fetched timestamp
      await prisma.rssFeed.update({
        where: { id: feed.id },
        data: { lastFetchedAt: new Date() },
      });
    } catch (feedError: any) {
      const errorMsg = `Feed "${feed.name}" (${feed.url}): ${feedError.message}`;
      console.error(errorMsg);
      results.errors.push(errorMsg);
    }
  }

  return results;
}

function extractImageUrl(item: any): string | null {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item["media:content"]?.$.url) return item["media:content"].$.url;
  const imgMatch = (item.content || "").match(/<img[^>]+src="([^"]+)"/);
  return imgMatch?.[1] || null;
}
