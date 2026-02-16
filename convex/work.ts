import { query } from "./_generated/server";

/**
 * Public queries for work portfolio content.
 * No authentication required — these power the public /work page.
 */

export const getPublishedProjects = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("workProjects")
            .withIndex("by_isPublished", (q) => q.eq("isPublished", true))
            .collect();
    },
});
