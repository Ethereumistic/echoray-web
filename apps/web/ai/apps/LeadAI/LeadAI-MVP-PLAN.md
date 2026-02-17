# LeadAI MVP Implementation Plan

## Overview
Internal lead generation tool for echoray.io targeting Bulgarian businesses needing web development services. Generates 10 qualified leads per search with comprehensive contact info and viability scoring.

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript + shadcn/ui + Tailwind CSS
- **Backend**: Convex database + Next.js API routes (Cloudflare Workers)
- **AI**: OpenRouter API (Qwen2.5-72B free tier for MVP)
- **Search**: Brave Search API
- **Hosting**: Cloudflare Workers

---

## System Architecture

```
[Input Form] → [Next.js API Route] → [AI Research Agent] → [Brave Search + Web Scraping] → [Scoring Engine] → [Convex DB] → [Dashboard Display]
```

---

## Database Schema (Convex)

```typescript
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  
  searches: defineTable({
    industry: v.string(),
    niche: v.optional(v.string()),
    websiteType: v.string(),
    country: v.string(),
    city: v.optional(v.string()),
    requestedLeadCount: v.number(),
    status: v.string(), // "in_progress" | "completed" | "failed"
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    totalLeadsFound: v.number(),
    aiModel: v.string(),
    totalTokensUsed: v.optional(v.number()),
    totalCost: v.optional(v.number()),
    errorLog: v.optional(v.array(v.string())),
  }).index("by_status", ["status"])
    .index("by_created", ["startedAt"]),
  
  leads: defineTable({
    searchId: v.id("searches"),
    
    // Basic Info
    companyName: v.string(),
    companyNameLocal: v.optional(v.string()),
    industry: v.string(),
    businessDescription: v.string(),
    
    // Contact Info
    emails: v.array(v.object({
      email: v.string(),
      type: v.string(),
      verified: v.boolean(),
    })),
    phones: v.array(v.object({
      number: v.string(),
      type: v.string(),
      verified: v.boolean(),
    })),
    addresses: v.array(v.object({
      street: v.string(),
      city: v.string(),
      postalCode: v.optional(v.string()),
      country: v.string(),
      type: v.string(),
    })),
    contactPersons: v.array(v.object({
      name: v.string(),
      position: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
    })),
    
    // Digital Presence
    website: v.optional(v.string()),
    websiteStatus: v.optional(v.object({
      hasHttps: v.boolean(),
      isMobileResponsive: v.boolean(),
      estimatedAge: v.optional(v.number()),
      techStack: v.optional(v.array(v.string())),
    })),
    socialMedia: v.array(v.object({
      platform: v.string(),
      url: v.string(),
      followers: v.optional(v.number()),
    })),
    googleBusinessUrl: v.optional(v.string()),
    
    // Bulgarian Registry Data
    registrationNumber: v.optional(v.string()),
    registryData: v.optional(v.object({
      source: v.string(),
      employeeCount: v.optional(v.number()),
      estimatedRevenue: v.optional(v.number()),
      registrationDate: v.optional(v.string()),
      legalStatus: v.optional(v.string()),
      directors: v.optional(v.array(v.string())),
      lastUpdated: v.string(),
    })),
    
    // Scoring
    viabilityScore: v.number(), // 0-100
    priorityTier: v.string(), // "hot" | "warm" | "cold" | "low"
    scoreBreakdown: v.object({
      contactInfoScore: v.number(),
      businessScaleScore: v.number(),
      digitalPresenceScore: v.number(),
      verificationScore: v.number(),
    }),
    
    // Status
    status: v.string(), // "new" | "rating_queued" | "rated" | "offer_created" | "contacted" | "converted" | "rejected"
    assignedTo: v.optional(v.string()),
    notes: v.optional(v.string()),
    
    // Phase 2 (Future)
    websiteRating: v.optional(v.object({
      overallScore: v.number(),
      seoScore: v.number(),
      designScore: v.number(),
      performanceScore: v.number(),
      ratedAt: v.string(),
      recommendations: v.array(v.string()),
    })),
    
    // Phase 3 (Future - Human-driven)
    offer: v.optional(v.object({
      createdAt: v.string(),
      createdBy: v.string(),
      offerType: v.string(),
      estimatedValue: v.number(),
      proposalDocument: v.optional(v.string()),
      sentAt: v.optional(v.string()),
      status: v.string(),
    })),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    dataSource: v.array(v.string()),
    aiConfidence: v.number(), // 0-1
    
  }).index("by_search", ["searchId"])
    .index("by_score", ["viabilityScore"])
    .index("by_status", ["status"])
    .index("by_priority", ["priorityTier"])
    .index("by_created", ["createdAt"]),
  
  apiUsage: defineTable({
    searchId: v.id("searches"),
    provider: v.string(),
    model: v.optional(v.string()),
    tokensUsed: v.optional(v.number()),
    requestCount: v.number(),
    cost: v.number(),
    timestamp: v.number(),
  }).index("by_search", ["searchId"])
    .index("by_timestamp", ["timestamp"]),
  
});
```

---

## Lead Scoring Algorithm

```typescript
// lib/scoring.ts

interface LeadData {
  emails: Array<{ email: string; type: string; verified: boolean }>;
  phones: Array<{ number: string; type: string; verified: boolean }>;
  contactPersons: Array<{ name: string; position?: string }>;
  registryData?: {
    employeeCount?: number;
    estimatedRevenue?: number;
  };
  website?: string;
  websiteStatus?: {
    hasHttps: boolean;
    isMobileResponsive: boolean;
    estimatedAge?: number;
  };
  registrationNumber?: string;
  googleBusinessUrl?: string;
  socialMedia: Array<{ platform: string; url: string }>;
}

export function calculateLeadScore(lead: LeadData) {
  let contactInfoScore = 0;
  let businessScaleScore = 0;
  let digitalPresenceScore = 0;
  let verificationScore = 0;
  
  // Contact Info (25 points max)
  if (lead.emails.length > 0) contactInfoScore += 10;
  if (lead.emails.length > 1) contactInfoScore += 5;
  if (lead.phones.length > 0) contactInfoScore += 5;
  if (lead.phones.length > 1) contactInfoScore += 3;
  if (lead.contactPersons.length > 0) contactInfoScore += 2;
  
  // Business Scale (30 points max)
  const employees = lead.registryData?.employeeCount || 0;
  if (employees > 50) businessScaleScore += 15;
  else if (employees > 10) businessScaleScore += 10;
  else if (employees > 0) businessScaleScore += 5;
  
  const revenue = lead.registryData?.estimatedRevenue || 0;
  if (revenue > 1000000) businessScaleScore += 15;
  else if (revenue > 500000) businessScaleScore += 10;
  else if (revenue > 100000) businessScaleScore += 5;
  
  // Digital Presence (25 points max)
  if (!lead.website) {
    digitalPresenceScore += 20; // No website = high opportunity
  } else {
    if (!lead.websiteStatus?.hasHttps) digitalPresenceScore += 10;
    if (!lead.websiteStatus?.isMobileResponsive) digitalPresenceScore += 8;
    if ((lead.websiteStatus?.estimatedAge || 0) > 5) digitalPresenceScore += 7;
  }
  
  // Verification (20 points max)
  if (lead.registrationNumber) verificationScore += 10;
  if (lead.googleBusinessUrl) verificationScore += 5;
  if (lead.socialMedia.length > 0) verificationScore += 5;
  
  const totalScore = Math.min(
    contactInfoScore + businessScaleScore + digitalPresenceScore + verificationScore,
    100
  );
  
  let priorityTier: "hot" | "warm" | "cold" | "low";
  if (totalScore >= 80) priorityTier = "hot";
  else if (totalScore >= 60) priorityTier = "warm";
  else if (totalScore >= 40) priorityTier = "cold";
  else priorityTier = "low";
  
  return {
    viabilityScore: totalScore,
    priorityTier,
    scoreBreakdown: {
      contactInfoScore,
      businessScaleScore,
      digitalPresenceScore,
      verificationScore,
    },
  };
}
```

---

## AI Research Pipeline

### Query Generation Prompt

```typescript
const generateSearchQueries = async (industry: string, niche: string, location: string) => {
  const prompt = `Generate 6 targeted search queries for finding ${industry} businesses in ${location}${niche ? ` specializing in ${niche}` : ''}.

Requirements:
- 3 queries in English
- 3 queries in Bulgarian (if location is Bulgaria)
- Mix of generic and specific terms
- Include business type variations

Return ONLY a JSON array of strings. Example:
["query 1", "query 2", "query 3", "query 4", "query 5", "query 6"]`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen/qwen-2.5-72b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  });
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};
```

### Data Extraction Prompt

```typescript
const extractLeadData = async (searchResults: string[], companyName: string) => {
  const prompt = `Extract structured business data for: ${companyName}

Available information:
${searchResults.join('\n\n')}

Extract and return ONLY valid JSON:
{
  "companyName": "string",
  "companyNameLocal": "string (Bulgarian name if available)",
  "businessDescription": "string (1-2 sentences)",
  "emails": [{"email": "string", "type": "general|sales|info", "verified": false}],
  "phones": [{"number": "string", "type": "office|mobile", "verified": false}],
  "addresses": [{"street": "string", "city": "string", "postalCode": "string", "country": "string", "type": "headquarters|branch"}],
  "contactPersons": [{"name": "string", "position": "string", "email": "string", "phone": "string"}],
  "website": "string (URL or null)",
  "websiteStatus": {"hasHttps": boolean, "isMobileResponsive": boolean, "estimatedAge": number},
  "socialMedia": [{"platform": "linkedin|facebook|instagram", "url": "string", "followers": number}],
  "googleBusinessUrl": "string (URL or null)",
  "registrationNumber": "string (EIK/BULSTAT or null)",
  "registryData": {"source": "papagal|sova", "employeeCount": number, "estimatedRevenue": number, "registrationDate": "YYYY-MM-DD", "legalStatus": "string", "directors": ["string"], "lastUpdated": "YYYY-MM-DD"},
  "aiConfidence": 0.0-1.0
}

Rules:
- Only include data you found in the sources
- Set aiConfidence based on data completeness
- Return null for missing fields
- Verify email/phone formats`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen/qwen-2.5-72b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    }),
  });
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};
```

---

## Risk Mitigation Strategies

### 1. Token Wastage Control

**Mitigations:**
- Hard limit: 3 search iterations per lead, 10 leads max
- Use JSON mode for structured outputs
- Cache search results for 24h
- Track tokens per API call
- Circuit breaker: Stop if error rate >30%
- Batch process where possible

### 2. Data Quality

**Mitigations:**
- Cross-reference 2+ sources minimum
- Always check papagal.bg/sova.bg for Bulgarian companies
- Track AI confidence (0-1) per data point
- Email validation: regex + DNS MX check
- Phone validation: format + country code
- Deduplicate: Hash companyName + registrationNumber
- Flag <70% confidence leads for manual review

### 3. API Rate Limits

**Mitigations:**
- Rate limit: Max 10 req/min for search APIs
- Exponential backoff: 1s, 2s, 4s, 8s delays
- Timeout: 30s max per request, retry once
- Queue system: Convex scheduled functions
- Health check APIs before search
- User-agent rotation for public registries

### 4. Pipeline Robustness

**Mitigations:**
- Transactional writes: Convex transactions
- Checkpoint: Save progress every 2 leads
- Resume capability: Store search state
- Detailed error logging with context
- Graceful degradation: Save partial data
- Track success rate, alert if <60%
- Keep raw AI responses for re-processing

### 5. Performance

**Mitigations:**
- Parallel processing: Research 3 leads concurrently
- Database indexes: searchId, status, score, createdAt
- Pagination: Load 20 leads at a time
- Lazy loading: Fetch details on-demand
- Timeout warnings: Show estimated time
- Background jobs: Convex actions for long tasks

---

## Implementation Steps

### 1. Database Setup
- Create Convex schema with searches, leads, apiUsage tables
- Set up indexes for efficient queries
- Create mutations for CRUD operations
- Create queries for dashboard data

### 2. API Routes (Next.js)
- `/api/lead-generation/start` - Initiates search
- `/api/lead-generation/status/[searchId]` - Polls progress
- `/api/search/brave` - Brave Search proxy
- `/api/scrape/registry` - papagal.bg/sova.bg scraper
- `/api/ai/generate-queries` - Query generation
- `/api/ai/extract-data` - Data extraction

### 3. AI Agent Core
- OpenRouter integration with Qwen2.5-72B
- Query generation logic
- Search result aggregation
- Data extraction with JSON schema validation
- Confidence scoring
- Error handling with retries

### 4. Web Scraping Module
- Brave Search API client
- Bulgarian registry scrapers (papagal.bg, sova.bg)
- Website status checker (HTTPS, mobile-responsive)
- Rate limiting wrapper
- Caching layer (24h TTL)

### 5. Scoring Engine
- Implement calculateLeadScore function
- Validate score components sum correctly
- Test with sample data
- Adjust weights based on real results

### 6. Frontend Components
- Search input form with shadcn/ui
- Industry/niche autocomplete
- Location selector (country + city)
- Progress indicator with real-time updates
- Lead dashboard table with sorting/filtering
- Lead detail modal
- Export to CSV button
- Error state handling

### 7. Background Processing
- Convex actions for async lead research
- Progress tracking with status updates
- Parallel processing (3 concurrent)
- Checkpoint system every 2 leads
- Resume failed searches

### 8. Monitoring & Logging
- Track: searches initiated/completed
- Average viability score
- Contact info completeness rate
- Token usage per search
- API error rates
- Time per lead
- Cost tracking

### 9. Testing
- Unit tests: Scoring algorithm
- Integration tests: API routes
- E2E test: Full search flow
- Edge cases: No results, API failures, invalid data
- Load test: 10 concurrent searches

### 10. Validation
- Run 5 test searches across different industries
- Manually verify lead accuracy
- Validate contact info (call 3-5 companies)
- Check Bulgarian registry data accuracy
- Confirm scoring logic with sales team
- Iterate based on feedback

---

## Success Criteria (MVP)

- Generate 10 leads per search
- Complete search in <5 minutes
- Contact info completeness >70%
- Viability score validated by sales team
- Zero cost (free tier only)
- <10% error rate
- Resume capability on failures

---

## Future Phases

### Phase 2: Website Rating Integration
- Trigger echoray.io rating tool after lead gen
- Store results in `websiteRating` field
- Enhance scoring with rating data
- Auto-prioritize low rating + high revenue leads

### Phase 3: Offer Creation (Human-Driven)
- Admin reviews rated leads
- Creates custom offers based on:
  - Website rating weaknesses
  - Business scale
  - Industry needs
- Stores offer in database
- Tracks status (draft, sent, accepted, rejected)

**Note**: Phase 3 requires human action. AI-generated offer templates will be automated in future iterations after pattern recognition.

---

## Environment Variables

```bash
# .env.local
OPENROUTER_API_KEY=sk-or-...
BRAVE_SEARCH_API_KEY=...
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...
```

---

## Cost Estimation

**MVP (Free Tier):**
- Qwen2.5-72B: $0
- Brave Search: $0 (2,000 queries/month free)
- Convex: $0 (free tier)
- Total: **$0**

**Production (Paid Models):**
- Claude-3.5-Sonnet: ~$0.50 per 10 leads
- Brave Search: ~$0.10 per search
- Convex: ~$5/month
- Total per 100 leads: **~$10-15**