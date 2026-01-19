/**
 * File Upload Utilities for V2 Architecture
 * Handles client-side file conversion and direct GitHub API uploads
 */

/**
 * Converts a File to base64 string with progress tracking
 * @param file - The file to convert
 * @param onProgress - Optional callback for progress updates (0-1)
 * @returns Promise resolving to base64 string (without data URL prefix)
 */
export function fileToBase64(
    file: File,
    onProgress?: (progress: number) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onprogress = (event: ProgressEvent<FileReader>) => {
            if (event.lengthComputable && onProgress) {
                const progress = event.loaded / event.total;
                onProgress(progress);
            }
        };

        reader.onload = () => {
            if (typeof reader.result === "string") {
                // Extract base64 content (remove "data:mime;base64," prefix)
                const base64 = reader.result.split(",")[1];
                resolve(base64);
            } else {
                reject(new Error("Failed to read file as base64"));
            }
        };

        reader.onerror = () => {
            reject(new Error("Failed to read file"));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Options for uploading a file to GitHub
 */
export interface GitHubUploadOptions {
    owner: string;
    repo: string;
    branch: string;
    path: string;
    content: string; // base64 encoded
    message: string;
    token: string;
    onProgress?: (progress: number) => void;
}

/**
 * Upload response from GitHub API
 */
export interface GitHubUploadResponse {
    commit: {
        sha: string;
    };
}

/**
 * Uploads a file to GitHub via REST API with retry logic
 * @param options - Upload configuration
 * @returns Promise resolving to GitHub response with commit SHA
 */
export async function uploadToGitHub(
    options: GitHubUploadOptions
): Promise<GitHubUploadResponse> {
    const url = `https://api.github.com/repos/${options.owner}/${options.repo}/contents/${options.path}`;

    // Check if file already exists (for overwrites)
    let existingSha: string | undefined;
    try {
        const checkResponse = await fetch(url, {
            headers: {
                Authorization: `Bearer ${options.token}`,
                Accept: "application/vnd.github.v3+json",
            },
        });
        if (checkResponse.ok) {
            const existing = (await checkResponse.json()) as { sha: string };
            existingSha = existing.sha;
        }
    } catch {
        // File doesn't exist, that's fine
    }

    // Upload file
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${options.token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message: options.message,
            content: options.content,
            branch: options.branch,
            ...(existingSha && { sha: existingSha }), // Include if updating
        }),
    });

    if (!response.ok) {
        const error = (await response.json().catch(() => ({ message: "Unknown error" }))) as { message?: string };
        throw new Error(error.message || `GitHub upload failed with status ${response.status}`);
    }

    const data = (await response.json()) as GitHubUploadResponse;

    // Simulate progress completion
    options.onProgress?.(1);

    return data;
}

/**
 * Upload file to GitHub with automatic retry logic
 * @param options - Upload configuration
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise resolving to GitHub response
 */
export async function uploadToGitHubWithRetry(
    options: GitHubUploadOptions,
    maxRetries = 3
): Promise<GitHubUploadResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await uploadToGitHub(options);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error("Unknown error");

            // Don't retry on client errors (4xx) except 429 (rate limit)
            if (error instanceof Error && "status" in error) {
                const status = (error as Error & { status: number }).status
                if (status >= 400 && status < 500 && status !== 429) {
                    throw error
                }
            }

            // Exponential backoff before retry
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error("Upload failed after retries");
}
