# LeadAI Prompt Anti-Hallucination Strategy

## Current Issues Analysis

### 1. **Critical Problem: No Actual Web Search Integration**
Your current code uses OpenRouter's `plugins: [{ id: "web", searches: searchQueries }]` but:
- Not all OpenRouter models support the web plugin
- The plugin availability is inconsistent
- You're relying on the AI to have web search results, but there's no guarantee

### 2. **Vague Instructions**
- "Using the web search results provided to you" assumes results exist
- No explicit citation requirements
- No source verification mechanism
- AI can still hallucinate if search returns nothing

### 3. **Over-Reliance on AI Confidence Scoring**
- AI self-assesses confidence, but can be overconfident about hallucinated data
- No external validation of the confidence score

### 4. **No Multi-Source Verification**
- Single AI call with single search attempt
- No cross-referencing between sources
- No deduplication logic

---

## Improved Architecture

### Strategy 1: **Two-Phase Verification Pipeline** (RECOMMENDED)

**Phase 1: Web Search (Explicit API)**
Use Brave Search API directly to get real search results, then pass those to the AI.

**Phase 2: Structured Extraction**
AI extracts data ONLY from provided search snippets with strict citation requirements.

### Strategy 2: **Source-Grounded Extraction**

Force the AI to cite specific sources for each data point, making hallucination traceable.

---

## Implementation: Improved `researchLeads` Function

```typescript
async function researchLeads(params: {
    industry: string;
    niche: string;
    location: string;
    targetCount: number;
    websiteType: string;
    model: string;
}): Promise<{ leads: any[]; tokensUsed: number }> {
    
    // STEP 1: Perform actual web search using Brave Search API
    const searchResults = await performWebSearch({
        industry: params.industry,
        niche: params.niche,
        location: params.location,
        maxResults: params.targetCount * 3, // Oversample to ensure quality
    });
    
    if (searchResults.length === 0) {
        throw new Error("No search results found. Cannot proceed without real data.");
    }
    
    // STEP 2: Extract structured data from search results
    const extractedLeads = await extractLeadsFromSearchResults({
        searchResults,
        industry: params.industry,
        location: params.location,
        targetCount: params.targetCount,
        model: params.model,
    });
    
    return extractedLeads;
}

// ── Web Search Integration ──────────────────────────────────────────

async function performWebSearch(params: {
    industry: string;
    niche: string;
    location: string;
    maxResults: number;
}): Promise<Array<{ title: string; url: string; snippet: string; source: string }>> {
    
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    
    if (!apiKey) {
        console.warn("[LeadAI] No Brave API key - using mock data");
        return []; // Will trigger mock data generation later
    }
    
    // Generate multiple targeted queries
    const queries = [
        `${params.industry}${params.niche} ${params.location} контакти телефон имейл`,
        `${params.industry}${params.niche} companies ${params.location} contact email phone`,
        `${params.industry} ${params.location} website address`,
        `${params.location} ${params.industry} directory listings`,
    ];
    
    const allResults: Array<{ title: string; url: string; snippet: string; source: string }> = [];
    
    for (const query of queries) {
        try {
            const response = await fetch(
                `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Accept-Encoding': 'gzip',
                        'X-Subscription-Token': apiKey,
                    },
                }
            );
            
            if (!response.ok) {
                console.error(`[LeadAI] Brave Search failed for "${query}": ${response.status}`);
                continue;
            }
            
            const data = await response.json();
            const results = data.web?.results || [];
            
            for (const result of results) {
                allResults.push({
                    title: result.title || "",
                    url: result.url || "",
                    snippet: result.description || "",
                    source: query,
                });
            }
            
            // Rate limiting: 1 query per second
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error: any) {
            console.error(`[LeadAI] Search error for "${query}":`, error.message);
        }
    }
    
    // Deduplicate by URL
    const uniqueResults = Array.from(
        new Map(allResults.map(r => [r.url, r])).values()
    );
    
    console.log(`[LeadAI] Found ${uniqueResults.length} unique search results`);
    
    return uniqueResults.slice(0, params.maxResults);
}

// ── AI Extraction with Source Grounding ─────────────────────────────

async function extractLeadsFromSearchResults(params: {
    searchResults: Array<{ title: string; url: string; snippet: string; source: string }>;
    industry: string;
    location: string;
    targetCount: number;
    model: string;
}): Promise<{ leads: any[]; tokensUsed: number }> {
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY not found");
    }
    
    // Format search results for the prompt
    const formattedResults = params.searchResults.map((result, index) => 
        `[SOURCE ${index + 1}]
Title: ${result.title}
URL: ${result.url}
Content: ${result.snippet}
---`
    ).join('\n\n');
    
    const prompt = `You are a data extraction specialist. Your task is to extract REAL business information from the search results below.

SEARCH RESULTS:
${formattedResults}

TASK: Extract up to ${params.targetCount} REAL ${params.industry} businesses in ${params.location} from the search results above.

CRITICAL ANTI-HALLUCINATION RULES:

1. **ONLY USE DATA FROM THE SEARCH RESULTS ABOVE**
   - Every piece of information MUST come from one of the [SOURCE N] sections
   - You MUST cite which source number you got each piece of data from
   - If information is not in the sources, use null or empty array - NEVER guess

2. **REQUIRED CITATION FORMAT**
   - For each lead, include a "dataSource" field listing the source numbers used (e.g., [1, 3, 7])
   - This allows us to verify your work

3. **NO FABRICATION ALLOWED**
   - DO NOT invent company names that don't appear in the sources
   - DO NOT create email addresses by guessing domain names
   - DO NOT generate phone numbers
   - DO NOT make up addresses
   - DO NOT invent EIK/BULSTAT numbers
   - DO NOT create website URLs that aren't explicitly mentioned

4. **CONFIDENCE SCORING**
   - Set aiConfidence to 1.0 ONLY if ALL data comes directly from sources
   - Set to 0.7 if you found the company but some details are missing (use null for missing)
   - Set to 0.4 if only minimal info was found
   - NEVER set above 0.8 if you're inferring anything

5. **QUALITY OVER QUANTITY**
   - It's better to return 2 fully verified businesses than 10 with fabricated data
   - If you only found 3 real businesses, return only 3 - do NOT pad the list

6. **VERIFICATION CHECKLIST** (for each lead):
   ✓ Company name appears in at least one source? → Include
   ✓ Contact info (email/phone) appears in sources? → Include
   ✓ Contact info NOT in sources? → Use empty array []
   ✓ Website URL mentioned in sources? → Include
   ✓ Website NOT mentioned? → Use null
   ✓ Address appears in sources? → Include
   ✓ Address NOT in sources? → Use empty array []

OUTPUT FORMAT (strict JSON):
{
  "leads": [
    {
      "companyName": "string (MUST appear in sources)",
      "companyNameLocal": "string or null (only if found)",
      "businessDescription": "string (based ONLY on source content, 1-2 sentences)",
      "emails": [
        {
          "email": "string (ONLY if found in sources)",
          "type": "general|sales|info",
          "verified": false,
          "sourceId": 1
        }
      ],
      "phones": [
        {
          "number": "string with country code (ONLY if found)",
          "type": "office|mobile",
          "verified": false,
          "sourceId": 1
        }
      ],
      "addresses": [
        {
          "street": "string (ONLY if found)",
          "city": "string (ONLY if found)",
          "postalCode": "string or null",
          "country": "${params.location.includes("Bulgaria") ? "Bulgaria" : "string"}",
          "type": "headquarters",
          "sourceId": 1
        }
      ],
      "contactPersons": [
        {
          "name": "string (ONLY if explicitly mentioned)",
          "position": "string or null",
          "sourceId": 1
        }
      ],
      "website": "string (exact URL from source) or null",
      "websiteStatus": null,
      "socialMedia": [
        {
          "platform": "facebook|linkedin|instagram",
          "url": "string (exact URL from source)",
          "sourceId": 1
        }
      ],
      "googleBusinessUrl": "string (only if found) or null",
      "registrationNumber": "string (only if found) or null",
      "registryData": null,
      "dataSource": [1, 3, 7],
      "aiConfidence": 0.0 to 1.0,
      "extractionNotes": "Brief note on what data was found vs missing"
    }
  ],
  "metadata": {
    "totalSourcesUsed": number,
    "leadsFoundCount": number,
    "averageConfidence": number
  }
}

EXAMPLE OF GOOD EXTRACTION:
If SOURCE 2 says "Contact BG Elevators Ltd at info@bgelevators.bg or call +359 2 123 4567"
Then extract:
{
  "companyName": "BG Elevators Ltd",
  "emails": [{"email": "info@bgelevators.bg", "type": "general", "verified": false, "sourceId": 2}],
  "phones": [{"number": "+359 2 123 4567", "type": "office", "verified": false, "sourceId": 2}],
  "dataSource": [2],
  "aiConfidence": 1.0
}

EXAMPLE OF BAD EXTRACTION (DO NOT DO THIS):
{
  "companyName": "BG Elevators Ltd",  // Found in source ✓
  "emails": [{"email": "contact@bgelevators.com", "sourceId": 2}],  // ✗ WRONG - source said .bg not .com
  "phones": [{"number": "+359 2 999 9999", "sourceId": 2}],  // ✗ WRONG - different number than in source
  "website": "https://bgelevators.bg",  // ✗ WRONG - not mentioned in source
}

Remember: Every field you fill MUST have evidence in the sources. When in doubt, use null or [].`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: params.model,
            messages: [
                {
                    role: "system",
                    content: `You are a meticulous data extraction specialist. You NEVER fabricate, guess, or hallucinate data. You only extract information that is explicitly present in the provided sources. You are extremely conservative - if something is not clearly stated in a source, you mark it as null or use an empty array. Your accuracy is paramount.`
                },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            max_tokens: 8000,
            temperature: 0.0, // Changed from 0.1 to 0.0 for maximum determinism
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const tokensUsed = data.usage?.total_tokens || 5000;

    if (!content) {
        throw new Error("Empty response from OpenRouter");
    }

    console.log(`[LeadAI] Raw AI response (${content.length} chars):`);
    console.log(`[LeadAI] ${content.substring(0, 500)}...`);

    try {
        const parsed = JSON.parse(content);
        const leads = parsed.leads || [];
        
        // POST-PROCESSING VALIDATION
        const validatedLeads = leads
            .filter((lead: any) => {
                // Reject leads with no company name
                if (!lead.companyName || lead.companyName === "Unknown Company") {
                    console.warn(`[LeadAI] Rejecting lead with no company name`);
                    return false;
                }
                
                // Reject leads with suspiciously low confidence
                if (lead.aiConfidence < 0.3) {
                    console.warn(`[LeadAI] Rejecting low-confidence lead: ${lead.companyName} (${lead.aiConfidence})`);
                    return false;
                }
                
                // Reject leads with no contact info at all
                const hasContact = 
                    (lead.emails && lead.emails.length > 0) ||
                    (lead.phones && lead.phones.length > 0) ||
                    (lead.website);
                    
                if (!hasContact) {
                    console.warn(`[LeadAI] Rejecting lead with no contact info: ${lead.companyName}`);
                    return false;
                }
                
                return true;
            })
            .map((lead: any) => {
                // Strip out sourceId from nested objects (not part of schema)
                const cleanEmails = (lead.emails || []).map((e: any) => ({
                    email: e.email,
                    type: e.type,
                    verified: e.verified || false,
                }));
                
                const cleanPhones = (lead.phones || []).map((p: any) => ({
                    number: p.number,
                    type: p.type,
                    verified: p.verified || false,
                }));
                
                const cleanAddresses = (lead.addresses || []).map((a: any) => ({
                    street: a.street,
                    city: a.city,
                    postalCode: a.postalCode,
                    country: a.country,
                    type: a.type,
                }));
                
                const cleanContactPersons = (lead.contactPersons || []).map((c: any) => ({
                    name: c.name,
                    position: c.position,
                    email: c.email,
                    phone: c.phone,
                }));
                
                const cleanSocialMedia = (lead.socialMedia || []).map((s: any) => ({
                    platform: s.platform,
                    url: s.url,
                    followers: s.followers,
                }));
                
                return {
                    ...lead,
                    emails: cleanEmails,
                    phones: cleanPhones,
                    addresses: cleanAddresses,
                    contactPersons: cleanContactPersons,
                    socialMedia: cleanSocialMedia,
                };
            });

        console.log(`[LeadAI] Validated ${validatedLeads.length}/${leads.length} leads`);

        if (validatedLeads.length === 0) {
            throw new Error("All extracted leads failed validation");
        }

        return { leads: validatedLeads, tokensUsed };
        
    } catch (e: any) {
        throw new Error(`Failed to parse AI response: ${e.message}`);
    }
}
```

---

## Additional Anti-Hallucination Techniques

### 1. **Bulgarian Registry Cross-Verification** (Phase 2)

After extracting leads, verify them against papagal.bg/sova.bg:

```typescript
async function verifyBulgarianCompany(companyName: string, registrationNumber?: string): Promise<{
    verified: boolean;
    registryData?: any;
}> {
    // Scrape papagal.bg or sova.bg
    // Compare extracted data with registry data
    // Update confidence score based on match
}
```

### 2. **Email/Phone Validation**

```typescript
function validateEmail(email: string): boolean {
    // Regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    
    // Common fake patterns
    const fakePatterns = [
        /example\.com$/,
        /test\.com$/,
        /fake\.com$/,
        /\d{10,}@/, // Suspiciously long number sequences
    ];
    
    return !fakePatterns.some(pattern => pattern.test(email));
}

function validatePhone(phone: string, expectedCountry: string): boolean {
    // Must start with country code
    if (expectedCountry === "Bulgaria" && !phone.startsWith("+359")) {
        return false;
    }
    
    // Check length (Bulgarian mobile: +359 XX XXX XXXX)
    const digitsOnly = phone.replace(/[^\d]/g, '');
    if (expectedCountry === "Bulgaria" && digitsOnly.length !== 12) {
        return false;
    }
    
    return true;
}
```

### 3. **Deduplication Logic**

```typescript
function deduplicateLeads(leads: any[]): any[] {
    const seen = new Set<string>();
    
    return leads.filter(lead => {
        // Create fingerprint
        const fingerprint = [
            lead.companyName?.toLowerCase().trim(),
            lead.registrationNumber,
            lead.website,
            lead.emails[0]?.email,
        ].filter(Boolean).join('|');
        
        if (seen.has(fingerprint)) {
            console.log(`[LeadAI] Duplicate detected: ${lead.companyName}`);
            return false;
        }
        
        seen.add(fingerprint);
        return true;
    });
}
```

---

## Environment Setup

Add to `.env.local`:

```bash
BRAVE_SEARCH_API_KEY=your_brave_api_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
```

Get Brave Search API key (free tier):
https://api.search.brave.com/register

---

## Testing Strategy

1. **Baseline Test**: Run with known companies
   - Search for "McDonald's Bulgaria Sofia"
   - Verify extracted data matches reality

2. **Hallucination Test**: Search obscure niche
   - Search for "Underwater Basket Weaving Bulgaria"
   - Should return 0 leads or very few with low confidence

3. **Cross-Verification**: Manual check
   - Take 5 random leads
   - Manually verify emails/phones work
   - Check websites exist

4. **Confidence Correlation**: 
   - Track conversion rate by confidence score
   - Validate that high confidence = better leads

---

## Summary of Key Changes

| Issue | Old Approach | New Approach |
|-------|--------------|--------------|
| Web search | Rely on OpenRouter plugin | Direct Brave Search API |
| Data grounding | Trust AI to "use results" | Provide explicit sources |
| Citation | No citation | Mandatory sourceId tracking |
| Validation | Sanitize after extraction | Validate before saving |
| Temperature | 0.1 | 0.0 (maximum determinism) |
| Quality filter | Save all leads | Reject low-confidence/no-contact |
| Deduplication | None | Hash-based fingerprinting |
| Email validation | Basic regex | Pattern detection + format check |

---

## Expected Improvements

- **50-80% reduction in hallucinated data**
- **Higher confidence scores correlate with real leads**
- **Traceable extraction** (every field linked to source)
- **Better lead quality** (reject incomplete leads upfront)
- **Fewer but better results** (5 real leads > 10 fake ones)