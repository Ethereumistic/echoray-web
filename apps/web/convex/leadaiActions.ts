import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { auth } from "./auth";

/**
 * LeadAI Anti-Hallucination Research Pipeline
 *
 * Two-Phase Architecture:
 *   Phase 1: Web Search via Brave Search API (real results)
 *   Phase 2: AI Extraction from source-grounded search results
 *   Fallback: OpenRouter web plugin if no Brave key configured
 *
 * Post-processing: Validation → Deduplication → Email/Phone checks → Sanitization
 */

async function checkAdminAction(ctx: any) {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return userId;
}

// ── Main Orchestration Action ────────────────────────────────────

export const startLeadSearch = action({
    args: {
        searchId: v.id("leadai_searches"),
        industry: v.string(),
        niche: v.optional(v.string()),
        websiteType: v.string(),
        country: v.string(),
        city: v.optional(v.string()),
        requestedLeadCount: v.number(),
        model: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await checkAdminAction(ctx);

        const {
            searchId,
            industry,
            niche,
            country,
            city,
            requestedLeadCount,
        } = args;
        const model = args.model || "arcee-ai/trinity-large-preview:free";

        const errors: string[] = [];
        let totalTokens = 0;

        // Fetch existing lead count (important for append/re-search mode)
        const existingSearch: { totalLeadsFound?: number } | null = await ctx.runQuery(api.leadai.getSearch, { id: searchId });
        let leadsFound: number = existingSearch?.totalLeadsFound ?? 0;

        try {
            const location = city ? `${city}, ${country}` : country;
            const nicheStr = niche ? ` specializing in ${niche}` : "";

            // Single AI call to research and generate leads
            const extractedLeads = await researchLeads({
                industry,
                niche: nicheStr,
                location,
                targetCount: requestedLeadCount,
                websiteType: args.websiteType,
                model,
            });

            totalTokens += extractedLeads.tokensUsed;

            // Track AI usage
            await ctx.runMutation(api.leadai.trackApiUsage, {
                searchId,
                provider: "openrouter",
                model,
                tokensUsed: extractedLeads.tokensUsed,
                requestCount: 1,
                cost: 0,
            });

            // Score and save each lead
            for (const rawLead of extractedLeads.leads.slice(0, requestedLeadCount)) {
                try {
                    const lead = sanitizeLead(rawLead);
                    const score = calculateScore(lead);

                    console.log(`[LeadAI] Saving lead: "${lead.companyName}" (confidence: ${lead.aiConfidence})`);

                    await ctx.runMutation(api.leadai.createLead, {
                        searchId,
                        companyName: lead.companyName || "Unknown Company",
                        companyNameLocal: lead.companyNameLocal || undefined,
                        industry,
                        businessDescription: lead.businessDescription || "No description available",
                        emails: lead.emails,
                        phones: lead.phones,
                        addresses: lead.addresses,
                        contactPersons: lead.contactPersons,
                        website: lead.website || undefined,
                        websiteStatus: lead.websiteStatus || undefined,
                        socialMedia: lead.socialMedia,
                        googleBusinessUrl: lead.googleBusinessUrl || undefined,
                        registrationNumber: lead.registrationNumber || undefined,
                        registryData: lead.registryData || undefined,
                        viabilityScore: score.viabilityScore,
                        priorityTier: score.priorityTier,
                        scoreBreakdown: score.scoreBreakdown,
                        dataSource: ["openrouter_ai"],
                        aiConfidence: lead.aiConfidence ?? 0.5,
                    });

                    leadsFound++;

                    // Real-time progress update
                    await ctx.runMutation(api.leadai.updateSearch, {
                        id: searchId,
                        totalLeadsFound: leadsFound,
                    });
                } catch (e: any) {
                    errors.push(`Failed to save lead "${rawLead.companyName}": ${e.message}`);
                }
            }

            // Mark search as completed
            await ctx.runMutation(api.leadai.updateSearch, {
                id: searchId,
                status: "completed",
                completedAt: Date.now(),
                totalLeadsFound: leadsFound,
                totalTokensUsed: totalTokens,
                totalCost: 0,
                errorLog: errors.length > 0 ? errors : undefined,
            });

            console.log(`[LeadAI] Search completed: ${leadsFound} leads found for "${industry}" in "${location}"`);
            if (errors.length > 0) {
                console.warn(`[LeadAI] Completed with ${errors.length} warnings:`, errors);
            }

        } catch (e: any) {
            const errorDetail = `Pipeline error: ${e.message}`;
            errors.push(errorDetail);
            console.error(`[LeadAI] Search FAILED for "${industry}":`, e.message);
            console.error(`[LeadAI] Full error stack:`, e.stack || "no stack");
            console.error(`[LeadAI] Error log:`, JSON.stringify(errors));

            // Mark search as completed (even with 0 leads) so the user can see it
            // and try re-searching with different parameters
            await ctx.runMutation(api.leadai.updateSearch, {
                id: searchId,
                status: leadsFound > 0 ? "completed" : "failed",
                completedAt: Date.now(),
                totalLeadsFound: leadsFound,
                totalTokensUsed: totalTokens,
                totalCost: 0,
                errorLog: errors,
            });
        }

        return { leadsFound, errors };
    },
});

// ── Two-Phase Anti-Hallucination Research Pipeline ───────────────

type SearchResult = { title: string; url: string; snippet: string; source: string };

async function researchLeads(params: {
    industry: string;
    niche: string;
    location: string;
    targetCount: number;
    websiteType: string;
    model: string;
}): Promise<{ leads: any[]; tokensUsed: number }> {
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
        // Mock leads for development without API key
        return { leads: generateMockLeads(params), tokensUsed: 0 };
    }

    // PHASE 1: Get real search results (Brave Search API or OpenRouter web plugin fallback)
    const braveKey = process.env.BRAVE_SEARCH_API_KEY;
    let searchResults: SearchResult[] = [];

    if (braveKey) {
        console.log(`[LeadAI] Phase 1: Performing Brave Search...`);
        searchResults = await performBraveSearch({
            industry: params.industry,
            niche: params.niche,
            location: params.location,
            maxResults: params.targetCount * 3,
            apiKey: braveKey,
        });
        console.log(`[LeadAI] Phase 1 complete: ${searchResults.length} search results`);
    }

    // PHASE 2: AI extraction from search results
    if (searchResults.length > 0) {
        // Source-grounded extraction (preferred — real search results)
        console.log(`[LeadAI] Phase 2: Extracting leads from ${searchResults.length} search results...`);
        return extractLeadsFromSearchResults({
            searchResults,
            industry: params.industry,
            niche: params.niche,
            location: params.location,
            targetCount: params.targetCount,
            model: params.model,
            openrouterKey,
        });
    } else {
        // Fallback: use OpenRouter web plugin (less reliable but still works)
        console.log(`[LeadAI] Phase 2 (fallback): Using OpenRouter web plugin...`);
        return extractLeadsViaWebPlugin({
            industry: params.industry,
            niche: params.niche,
            location: params.location,
            targetCount: params.targetCount,
            model: params.model,
            openrouterKey,
        });
    }
}

// ── Phase 1: Brave Search ────────────────────────────────────────

async function performBraveSearch(params: {
    industry: string;
    niche: string;
    location: string;
    maxResults: number;
    apiKey: string;
}): Promise<SearchResult[]> {
    const queries = [
        `${params.industry}${params.niche} ${params.location} контакти телефон имейл`,
        `${params.industry}${params.niche} companies ${params.location} contact email phone`,
        `${params.industry} ${params.location} website address`,
        `${params.location} ${params.industry} directory listings`,
    ];

    const allResults: SearchResult[] = [];

    for (const query of queries) {
        try {
            const response = await fetch(
                `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`,
                {
                    headers: {
                        "Accept": "application/json",
                        "Accept-Encoding": "gzip",
                        "X-Subscription-Token": params.apiKey,
                    },
                }
            );

            if (!response.ok) {
                console.error(`[LeadAI] Brave Search failed for "${query}": ${response.status}`);
                continue;
            }

            const data: any = await response.json();
            const results = data.web?.results || [];

            for (const result of results) {
                allResults.push({
                    title: result.title || "",
                    url: result.url || "",
                    snippet: result.description || "",
                    source: query,
                });
            }

            // Rate limiting: 1 query per second (Brave free tier)
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error: any) {
            console.error(`[LeadAI] Search error for "${query}":`, error.message);
        }
    }

    // Deduplicate by URL
    const uniqueResults = Array.from(
        new Map(allResults.map(r => [r.url, r])).values()
    );

    return uniqueResults.slice(0, params.maxResults);
}

// ── Phase 2A: Source-Grounded Extraction (Brave results) ─────────

async function extractLeadsFromSearchResults(params: {
    searchResults: SearchResult[];
    industry: string;
    niche: string;
    location: string;
    targetCount: number;
    model: string;
    openrouterKey: string;
}): Promise<{ leads: any[]; tokensUsed: number }> {
    // Format search results as numbered sources
    const formattedResults = params.searchResults
        .map((result, index) =>
            `[SOURCE ${index + 1}]\nTitle: ${result.title}\nURL: ${result.url}\nContent: ${result.snippet}\n---`
        )
        .join("\n\n");

    const prompt = `You are a data extraction specialist. Your task is to extract REAL business information from the search results below.

SEARCH RESULTS:
${formattedResults}

TASK: Extract up to ${params.targetCount} REAL ${params.industry}${params.niche} businesses in ${params.location} from the search results above.

CRITICAL ANTI-HALLUCINATION RULES:

1. **ONLY USE DATA FROM THE SEARCH RESULTS ABOVE**
   - Every piece of information MUST come from one of the [SOURCE N] sections
   - If information is not in the sources, use null or empty array - NEVER guess

2. **NO FABRICATION ALLOWED**
   - DO NOT invent company names that don't appear in the sources
   - DO NOT create email addresses by guessing domain names
   - DO NOT generate phone numbers
   - DO NOT make up addresses
   - DO NOT invent EIK/BULSTAT numbers
   - DO NOT create website URLs that aren't explicitly mentioned

3. **CONFIDENCE SCORING**
   - Set aiConfidence to 1.0 ONLY if ALL data comes directly from sources
   - Set to 0.7 if you found the company but some details are missing (use null for missing)
   - Set to 0.4 if only minimal info was found
   - NEVER set above 0.8 if you're inferring anything

4. **QUALITY OVER QUANTITY**
   - It's better to return 2 fully verified businesses than 10 with fabricated data
   - If you only found 3 real businesses, return only 3 - do NOT pad the list

5. **VERIFICATION CHECKLIST** (for each lead):
   ✓ Company name appears in at least one source? → Include
   ✓ Contact info (email/phone) appears in sources? → Include
   ✓ Contact info NOT in sources? → Use empty array []
   ✓ Website URL mentioned in sources? → Include
   ✓ Website NOT mentioned? → Use null

OUTPUT FORMAT (strict JSON):
{
  "leads": [
    {
      "companyName": "string (MUST appear in sources)",
      "companyNameLocal": "string or null (only if found)",
      "businessDescription": "string (based ONLY on source content, 1-2 sentences)",
      "emails": [{"email": "string", "type": "general|sales|info", "verified": false}],
      "phones": [{"number": "string with country code", "type": "office|mobile", "verified": false}],
      "addresses": [{"street": "string", "city": "string", "postalCode": "string or null", "country": "string", "type": "headquarters"}],
      "contactPersons": [{"name": "string", "position": "string or null"}],
      "website": "string (exact URL from source) or null",
      "websiteStatus": null,
      "socialMedia": [{"platform": "facebook|linkedin|instagram", "url": "string"}],
      "googleBusinessUrl": "string or null",
      "registrationNumber": "string or null",
      "registryData": null,
      "dataSource": "string (URL where you found this business)",
      "aiConfidence": 0.0 to 1.0
    }
  ]
}

REMEMBER: Every field you fill MUST have evidence in the sources. When in doubt, use null or [].`;

    const isXAI = params.model.startsWith("x-ai/");
    const requestBody: Record<string, any> = {
        model: params.model,
        messages: [
            {
                role: "system",
                content: "You are a meticulous data extraction specialist. You NEVER fabricate, guess, or hallucinate data. You only extract information that is explicitly present in the provided sources. You are extremely conservative - if something is not clearly stated in a source, you mark it as null or use an empty array. Your accuracy is paramount.",
            },
            { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 8000,
        temperature: 0.0, // Maximum determinism
    };

    if (isXAI) {
        requestBody.provider = { only: ["xai"] };
        console.log(`[LeadAI] Using xAI BYOK routing for model: ${params.model}`);
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${params.openrouterKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const tokensUsed = data.usage?.total_tokens || 5000;

    if (!content) throw new Error("Empty response from OpenRouter");

    console.log(`[LeadAI] Raw AI response (${content.length} chars):`);
    console.log(`[LeadAI] ${content.substring(0, 500)}...`);

    return parseAndValidateLeads(content, tokensUsed);
}

// ── Phase 2B: OpenRouter Web Plugin Fallback ─────────────────────

async function extractLeadsViaWebPlugin(params: {
    industry: string;
    niche: string;
    location: string;
    targetCount: number;
    model: string;
    openrouterKey: string;
}): Promise<{ leads: any[]; tokensUsed: number }> {
    const prompt = `You are a business research assistant. Using the web search results provided to you, find ${params.targetCount} REAL ${params.industry}${params.niche} businesses in ${params.location}.

IMPORTANT: Try your best to find exactly ${params.targetCount} distinct businesses. Use every relevant search result available.

CRITICAL RULES:
1. You MUST ONLY include businesses that appear in the web search results
2. DO NOT invent, fabricate, or hallucinate ANY data
3. If you cannot find a piece of information, use null or empty arrays — NEVER make it up
4. Only include contact details found in the actual search results
5. If you find fewer businesses, return only those you found — do NOT pad with fabricated entries
6. Set aiConfidence to 0.9 if all data comes directly from search results, 0.6 if partially inferred

Return a JSON object with this structure:
{
  "leads": [
    {
      "companyName": "string",
      "companyNameLocal": "string or null",
      "businessDescription": "string (1-2 sentences)",
      "emails": [{"email": "string", "type": "general|sales|info", "verified": false}],
      "phones": [{"number": "string (with country code)", "type": "office|mobile", "verified": false}],
      "addresses": [{"street": "string", "city": "string", "postalCode": "string", "country": "string", "type": "headquarters"}],
      "contactPersons": [{"name": "string", "position": "string or null"}],
      "website": "string or null",
      "websiteStatus": null,
      "socialMedia": [{"platform": "facebook|instagram|linkedin", "url": "string"}],
      "googleBusinessUrl": "string or null",
      "registrationNumber": "string or null",
      "registryData": null,
      "dataSource": "string (URL where you found this business)",
      "aiConfidence": 0.0 to 1.0
    }
  ]
}

REMEMBER: Empty arrays and null values are ALWAYS preferred over made-up data. But DO search thoroughly — extract EVERY distinct real business from the results.`;

    const searchQueries = [
        `${params.industry}${params.niche} ${params.location} контакти телефон имейл`,
        `${params.industry}${params.niche} companies ${params.location} contact email`,
        `${params.industry}${params.niche} ${params.location} directory list`,
        `${params.industry} ${params.location} фирми адрес`,
        `top ${params.industry}${params.niche} ${params.location}`,
    ];

    const isXAI = params.model.startsWith("x-ai/");
    const requestBody: Record<string, any> = {
        model: params.model,
        messages: [
            {
                role: "system",
                content: "You are a factual business research assistant. You NEVER fabricate data. You only report information found in web search results. If you cannot verify something, you leave it null or empty.",
            },
            { role: "user", content: prompt },
        ],
        plugins: [{ id: "web", searches: searchQueries }],
        response_format: { type: "json_object" },
        max_tokens: 8000,
        temperature: 0.1,
    };

    if (isXAI) {
        requestBody.provider = { only: ["xai"] };
        console.log(`[LeadAI] Using xAI BYOK routing for model: ${params.model}`);
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${params.openrouterKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const tokensUsed = data.usage?.total_tokens || 3000;

    if (!content) throw new Error("Empty response from OpenRouter");

    console.log(`[LeadAI] Raw AI response (${content.length} chars):`);
    console.log(`[LeadAI] ${content.substring(0, 2000)}${content.length > 2000 ? "...TRUNCATED" : ""}`);

    return parseAndValidateLeads(content, tokensUsed);
}

// ── Shared Response Parser + Post-Extraction Validation ──────────

function parseAndValidateLeads(content: string, tokensUsed: number): { leads: any[]; tokensUsed: number } {
    let parsed: any;
    try {
        parsed = JSON.parse(content);
    } catch {
        // Try to extract JSON from the response if it has extra text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                parsed = JSON.parse(jsonMatch[0]);
            } catch {
                throw new Error("Failed to parse AI response as JSON");
            }
        } else {
            throw new Error("No JSON found in AI response");
        }
    }

    const leads = parsed.leads || parsed.results || [];

    if (!Array.isArray(leads) || leads.length === 0) {
        console.warn(`[LeadAI] AI returned 0 leads — no businesses found for this search`);
        return { leads: [], tokensUsed };
    }

    console.log(`[LeadAI] Parsed ${leads.length} raw leads, validating...`);

    // Post-extraction validation
    const validated = leads.filter((lead: any) => {
        // Reject leads with no company name
        if (!lead.companyName || lead.companyName === "Unknown Company") {
            console.warn(`[LeadAI] ✗ Rejecting lead with no company name`);
            return false;
        }

        // Reject leads with suspiciously low confidence
        if (typeof lead.aiConfidence === "number" && lead.aiConfidence < 0.3) {
            console.warn(`[LeadAI] ✗ Rejecting low-confidence lead: ${lead.companyName} (${lead.aiConfidence})`);
            return false;
        }

        // Reject leads with no contact info at all
        const hasContact =
            (Array.isArray(lead.emails) && lead.emails.length > 0) ||
            (Array.isArray(lead.phones) && lead.phones.length > 0) ||
            lead.website;

        if (!hasContact) {
            console.warn(`[LeadAI] ✗ Rejecting lead with no contact info: ${lead.companyName}`);
            return false;
        }

        console.log(`[LeadAI] ✓ Validated lead: ${lead.companyName}`);
        return true;
    });

    // Deduplication
    const deduplicated = deduplicateLeads(validated);

    console.log(`[LeadAI] Final: ${deduplicated.length}/${leads.length} leads passed validation`);

    if (deduplicated.length === 0) {
        console.warn(`[LeadAI] All extracted leads failed validation — returning empty results`);
        return { leads: [], tokensUsed };
    }

    return { leads: deduplicated, tokensUsed };
}

// ── Deduplication ────────────────────────────────────────────────

function deduplicateLeads(leads: any[]): any[] {
    const seen = new Set<string>();

    return leads.filter((lead: any) => {
        const fingerprint = [
            lead.companyName?.toLowerCase().trim(),
            lead.registrationNumber,
            lead.website,
            lead.emails?.[0]?.email,
        ].filter(Boolean).join("|");

        if (seen.has(fingerprint)) {
            console.log(`[LeadAI] Duplicate detected: ${lead.companyName}`);
            return false;
        }

        seen.add(fingerprint);
        return true;
    });
}

// ── Mock Data Generator ──────────────────────────────────────────

function generateMockLeads(params: {
    industry: string;
    location: string;
    targetCount: number;
}): any[] {
    const mockNames = [
        "Golden Sunrise", "Blue Horizon", "Crystal Palace",
        "Mountain View", "Silver Star", "Urban Garden",
        "Royal Oak", "Sunrise Valley", "Diamond Bridge",
        "Heritage House",
    ];

    return Array.from({ length: Math.min(params.targetCount, 10) }, (_, i) => ({
        companyName: `${mockNames[i] || `Business ${i + 1}`} ${params.industry}`,
        companyNameLocal: null,
        businessDescription: `A well-established ${params.industry.toLowerCase()} business located in ${params.location}. Known for quality service and local reputation.`,
        emails: [
            { email: `info@${mockNames[i]?.toLowerCase().replace(/\s/g, "") || `biz${i}`}.bg`, type: "general", verified: false },
        ],
        phones: [
            { number: `+359 ${2 + i} ${String(100 + i * 37).padStart(3, "0")} ${String(200 + i * 13).padStart(4, "0")}`, type: "office", verified: false },
        ],
        addresses: [
            { street: `ul. Example ${10 + i}`, city: params.location.split(",")[0], postalCode: `${1000 + i * 100}`, country: "Bulgaria", type: "headquarters" },
        ],
        contactPersons: [
            { name: `Ivan Petrov ${i + 1}`, position: "Owner" },
        ],
        website: i % 3 === 0 ? null : `http://www.${mockNames[i]?.toLowerCase().replace(/\s/g, "") || `biz${i}`}.bg`,
        websiteStatus: i % 3 === 0
            ? null
            : { hasHttps: i % 2 === 0, isMobileResponsive: i % 4 === 0, estimatedAge: 3 + i },
        socialMedia: i % 2 === 0
            ? [{ platform: "facebook", url: `https://facebook.com/${mockNames[i]?.toLowerCase().replace(/\s/g, "") || `biz${i}`}` }]
            : [],
        googleBusinessUrl: i % 3 === 1 ? `https://g.co/maps/${mockNames[i]?.toLowerCase().replace(/\s/g, "")}` : null,
        registrationNumber: i % 2 === 0 ? `${200000000 + i * 12345}` : null,
        registryData: null,
        aiConfidence: 0.3,
    }));
}

// ── Scoring (mirrors lib/lead-scoring.ts) ────────────────────────

function calculateScore(lead: any) {
    let contactInfoScore = 0;
    let businessScaleScore = 0;
    let digitalPresenceScore = 0;
    let verificationScore = 0;

    const emails = normalizeArray(lead.emails);
    const phones = normalizeArray(lead.phones);
    const contactPersons = normalizeArray(lead.contactPersons);
    const socialMedia = normalizeArray(lead.socialMedia);

    if (emails.length > 0) contactInfoScore += 10;
    if (emails.length > 1) contactInfoScore += 5;
    if (phones.length > 0) contactInfoScore += 5;
    if (phones.length > 1) contactInfoScore += 3;
    if (contactPersons.length > 0) contactInfoScore += 2;

    const employees = lead.registryData?.employeeCount || 0;
    if (employees > 50) businessScaleScore += 15;
    else if (employees > 10) businessScaleScore += 10;
    else if (employees > 0) businessScaleScore += 5;

    const revenue = lead.registryData?.estimatedRevenue || 0;
    if (revenue > 1000000) businessScaleScore += 15;
    else if (revenue > 500000) businessScaleScore += 10;
    else if (revenue > 100000) businessScaleScore += 5;

    if (!lead.website) {
        digitalPresenceScore += 20;
    } else {
        if (!lead.websiteStatus?.hasHttps) digitalPresenceScore += 10;
        if (!lead.websiteStatus?.isMobileResponsive) digitalPresenceScore += 8;
        if ((lead.websiteStatus?.estimatedAge || 0) > 5) digitalPresenceScore += 7;
    }

    if (lead.registrationNumber) verificationScore += 10;
    if (lead.googleBusinessUrl) verificationScore += 5;
    if (socialMedia.length > 0) verificationScore += 5;

    const viabilityScore = Math.min(
        contactInfoScore + businessScaleScore + digitalPresenceScore + verificationScore,
        100
    );

    let priorityTier: "hot" | "warm" | "cold" | "low";
    if (viabilityScore >= 80) priorityTier = "hot";
    else if (viabilityScore >= 60) priorityTier = "warm";
    else if (viabilityScore >= 40) priorityTier = "cold";
    else priorityTier = "low";

    return {
        viabilityScore,
        priorityTier,
        scoreBreakdown: {
            contactInfoScore,
            businessScaleScore,
            digitalPresenceScore,
            verificationScore,
        },
    };
}

// ── Data Sanitization ────────────────────────────────────────────

/**
 * Cleans raw AI lead data to match our Convex validators.
 * LLMs love sending `null` for optional fields, but Convex wants `undefined`.
 * They also sometimes send malformed objects in arrays.
 */
function sanitizeLead(raw: any): any {
    // Helper: treat null, "null", "undefined", "none", "N/A", empty string as undefined
    const isJunk = (v: any) => v == null || (typeof v === "string" && ["null", "undefined", "none", "n/a", ""].includes(v.trim().toLowerCase()));
    const str = (v: any) => (typeof v === "string" && !isJunk(v) ? v.trim() : undefined);
    const strRequired = (v: any, fallback = "") => (typeof v === "string" && !isJunk(v) ? v.trim() : fallback);
    const bool = (v: any, fallback = false) => (typeof v === "boolean" ? v : fallback);
    const num = (v: any) => (typeof v === "number" && !isNaN(v) ? v : undefined);

    // Sanitize emails array — with fake-pattern detection
    const emails = normalizeArray(raw.emails)
        .filter((e: any) => e && typeof e.email === "string" && !isJunk(e.email) && e.email.includes("@"))
        .filter((e: any) => validateEmail(e.email))
        .map((e: any) => ({
            email: e.email.trim(),
            type: strRequired(e.type, "general"),
            verified: bool(e.verified),
        }));

    // Sanitize phones array — with format validation
    const phones = normalizeArray(raw.phones)
        .filter((p: any) => p && typeof p.number === "string" && !isJunk(p.number))
        .filter((p: any) => validatePhone(p.number))
        .map((p: any) => ({
            number: p.number.trim(),
            type: strRequired(p.type, "office"),
            verified: bool(p.verified),
        }));

    // Sanitize addresses — postalCode often comes as null
    const addresses = normalizeArray(raw.addresses)
        .filter((a: any) => a && ((typeof a.street === "string" && !isJunk(a.street)) || (typeof a.city === "string" && !isJunk(a.city))))
        .map((a: any) => ({
            street: strRequired(a.street, "Unknown"),
            city: strRequired(a.city, "Unknown"),
            postalCode: str(a.postalCode),
            country: strRequired(a.country, "Bulgaria"),
            type: strRequired(a.type, "headquarters"),
        }));

    // Sanitize contact persons
    const contactPersons = normalizeArray(raw.contactPersons)
        .filter((c: any) => c && typeof c.name === "string" && c.name.trim())
        .map((c: any) => ({
            name: c.name.trim(),
            position: str(c.position),
            email: str(c.email),
            phone: str(c.phone),
        }));

    // Sanitize social media
    const socialMedia = normalizeArray(raw.socialMedia)
        .filter((s: any) => s && typeof s.url === "string" && s.url.startsWith("http"))
        .map((s: any) => ({
            platform: strRequired(s.platform, "other"),
            url: s.url.trim(),
            followers: num(s.followers),
        }));

    // Sanitize website status
    let websiteStatus = undefined;
    if (raw.websiteStatus && typeof raw.websiteStatus === "object") {
        websiteStatus = {
            hasHttps: bool(raw.websiteStatus.hasHttps),
            isMobileResponsive: bool(raw.websiteStatus.isMobileResponsive),
            estimatedAge: num(raw.websiteStatus.estimatedAge),
            techStack: Array.isArray(raw.websiteStatus.techStack)
                ? raw.websiteStatus.techStack.filter((t: any) => typeof t === "string")
                : undefined,
        };
    }

    // Sanitize registry data
    let registryData = undefined;
    if (raw.registryData && typeof raw.registryData === "object" && str(raw.registryData.source)) {
        registryData = {
            source: strRequired(raw.registryData.source, "public_records"),
            employeeCount: num(raw.registryData.employeeCount),
            estimatedRevenue: num(raw.registryData.estimatedRevenue),
            registrationDate: str(raw.registryData.registrationDate),
            legalStatus: str(raw.registryData.legalStatus),
            directors: Array.isArray(raw.registryData.directors)
                ? raw.registryData.directors.filter((d: any) => typeof d === "string")
                : undefined,
            lastUpdated: strRequired(raw.registryData.lastUpdated, new Date().toISOString().split("T")[0]),
        };
    }

    return {
        companyName: strRequired(raw.companyName, "Unknown Company"),
        companyNameLocal: str(raw.companyNameLocal),
        businessDescription: strRequired(raw.businessDescription, "No description available"),
        emails,
        phones,
        addresses,
        contactPersons,
        website: str(raw.website),
        websiteStatus,
        socialMedia,
        googleBusinessUrl: str(raw.googleBusinessUrl),
        registrationNumber: str(raw.registrationNumber),
        registryData,
        aiConfidence: typeof raw.aiConfidence === "number" ? raw.aiConfidence : 0.3,
    };
}

function normalizeArray(arr: any): any[] {
    return Array.isArray(arr) ? arr : [];
}

// ── Email/Phone Validation ───────────────────────────────────────

function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.warn(`[LeadAI] Invalid email format: ${email}`);
        return false;
    }

    // Common fake/hallucinated patterns
    const fakePatterns = [
        /example\.com$/i,
        /test\.com$/i,
        /fake\.com$/i,
        /sample\.com$/i,
        /placeholder\./i,
        /\d{10,}@/, // Suspiciously long number sequences before @
    ];

    if (fakePatterns.some(pattern => pattern.test(email))) {
        console.warn(`[LeadAI] Suspicious email rejected: ${email}`);
        return false;
    }

    return true;
}

function validatePhone(phone: string): boolean {
    // Strip formatting to count digits
    const digitsOnly = phone.replace(/[^\d]/g, "");

    // Must have at least 7 digits to be a real phone
    if (digitsOnly.length < 7) {
        console.warn(`[LeadAI] Phone too short: ${phone}`);
        return false;
    }

    // Reject obviously fake patterns (all same digit, sequential)
    if (/^(\d)\1+$/.test(digitsOnly)) {
        console.warn(`[LeadAI] Suspicious phone rejected (repeating): ${phone}`);
        return false;
    }

    return true;
}
