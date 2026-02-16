import { query } from "./_generated/server";
import { v } from "convex/values";

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

export const getProjectBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, { slug }) => {
        const project = await ctx.db
            .query("workProjects")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .first();

        if (!project || !project.isPublished) return null;

        // Return only public-facing fields
        return {
            _id: project._id,
            title: project.title,
            slug: project.slug,
            link: project.link,
            thumbnail: project.thumbnail,
            tagline: project.tagline,
            description: project.description,
            projectType: project.projectType,
            techStack: project.techStack,
            status: project.status,
            ogImage: project.ogImage,
            phoneMockup: project.phoneMockup,
            launchDate: project.launchDate,
            completedDate: project.completedDate,
        };
    },
});
