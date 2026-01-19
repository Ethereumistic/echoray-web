import { Octokit } from "@octokit/rest";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * GitHub - GitHub API integration for file uploads
 * Handles repository creation and file commits
 */

/**
 * Create a GitHub repository with folder structure
 * Called asynchronously after repo record is created
 */
export const createRepository = internalAction({
    args: {
        repoId: v.id("repos"),
        repoName: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if token exists
        const token = process.env.GITHUB_BOT_TOKEN;

        if (!token) {
            console.error("GITHUB_BOT_TOKEN is not set!");
            await ctx.runMutation(internal.repos.updateRepoStatus, {
                repoId: args.repoId,
                status: "failed",
            });
            return;
        }

        console.log("Creating GitHub repo:", args.repoName);
        console.log("Token exists:", token ? "YES" : "NO");
        console.log("Token starts with:", token.substring(0, 7));

        const octokit = new Octokit({
            auth: token,
        });

        try {
            // Check if repo already exists
            let repoExists = false;
            try {
                await octokit.repos.get({
                    owner: "echoray-io",
                    repo: args.repoName,
                });
                repoExists = true;
                console.log("Repository already exists on GitHub, skipping creation");
            } catch (error: any) {
                if (error.status !== 404) {
                    throw error; // Re-throw if it's not a "not found" error
                }
                console.log("Repository doesn't exist, will create it");
            }

            // 1. Create repository only if it doesn't exist
            if (!repoExists) {
                console.log("Calling GitHub API to create repo...");
                const repoResponse = await octokit.repos.createForAuthenticatedUser({
                    name: args.repoName,
                    description: `Asset repository for ${args.repoName}`,
                    private: false,
                    auto_init: true,
                });

                console.log("Repository created successfully:", repoResponse.data.html_url);

                // Wait a moment for repo initialization
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // 2. Create folder structure with .gitkeep files
            const folders = ["file", "document", "image", "video"];

            for (const folder of folders) {
                console.log(`Creating folder: ${folder}`);
                try {
                    await octokit.repos.createOrUpdateFileContents({
                        owner: "echoray-io",
                        repo: args.repoName,
                        path: `${folder}/.gitkeep`,
                        message: `Initialize ${folder} folder`,
                        content: btoa(""), // Use btoa() instead of Buffer for edge runtime
                    });
                } catch (error: any) {
                    // Ignore if file already exists
                    if (error.status !== 422) {
                        throw error;
                    }
                    console.log(`Folder ${folder} already exists, skipping`);
                }
            }

            console.log("All folders created successfully");

            // 3. Update repo status to active
            await ctx.runMutation(internal.repos.updateRepoStatus, {
                repoId: args.repoId,
                status: "active",
            });

        } catch (error) {
            console.error("GitHub repo creation failed:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));

            await ctx.runMutation(internal.repos.updateRepoStatus, {
                repoId: args.repoId,
                status: "failed",
            });
        }
    },
});

/**
 * Delete a GitHub repository (Danger Zone)
 * This will permanently delete all files in the repo
 */
export const deleteRepository = internalAction({
    args: {
        repoName: v.string(),
    },
    handler: async (ctx, args) => {
        const octokit = new Octokit({
            auth: process.env.GITHUB_BOT_TOKEN,
        });

        try {
            console.log("Deleting GitHub repository:", args.repoName);
            await octokit.repos.delete({
                owner: "echoray-io",
                repo: args.repoName,
            });
            console.log("Repository deleted successfully");
        } catch (error: any) {
            if (error.status === 404) {
                console.log("Repository doesn't exist on GitHub, nothing to delete");
            } else {
                console.error("Failed to delete repository:", error);
                throw error;
            }
        }
    },
});

/**
 * Commit a file to a GitHub repository
 * Returns the commit SHA on success
 */
export const commitFileToGitHub = async (
    repoName: string,
    filePath: string,
    fileName: string,
    fileBuffer: ArrayBuffer
): Promise<string> => {
    const octokit = new Octokit({
        auth: process.env.GITHUB_BOT_TOKEN,
    });

    // Convert ArrayBuffer to base64 using chunked approach (more memory efficient)
    const uint8Array = new Uint8Array(fileBuffer);
    const chunkSize = 8192; // Process 8KB at a time
    const binaryParts: string[] = [];

    for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        let binaryString = '';
        for (let j = 0; j < chunk.length; j++) {
            binaryString += String.fromCharCode(chunk[j]);
        }
        binaryParts.push(binaryString);
    }

    // Join binary parts THEN encode to base64 (encoding chunks breaks padding)
    const base64Content = btoa(binaryParts.join(''));

    const response = await octokit.repos.createOrUpdateFileContents({
        owner: "echoray-io",
        repo: repoName,
        path: filePath,
        message: `Upload ${fileName}`,
        content: base64Content,
    });

    return response.data.commit.sha!;
};
