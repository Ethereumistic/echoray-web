import { query } from "./_generated/server";

/**
 * Public queries for work portfolio content.
 * No authentication required — these power the public /work page.
 */

export const getPublishedProjects = query({
    args: {},
    handler: async (ctx) => {
        const projects = await ctx.db
            .query("workProjects")
            .withIndex("by_isPublished", (q) => q.eq("isPublished", true))
            .collect();
        // Sort by display order set in CMS
        return projects.sort((a, b) => a.order - b.order);
    },
});
