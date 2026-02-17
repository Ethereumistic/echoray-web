/**
 * LeadAI Scoring Algorithm
 * Pure function — no side effects, usable on frontend + backend
 *
 * Categories:
 *  - Contact Info (25 pts max)
 *  - Business Scale (30 pts max)
 *  - Digital Presence (25 pts max)
 *  - Verification (20 pts max)
 *  Total: 100 pts max
 */

export interface LeadData {
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

export interface ScoreResult {
    viabilityScore: number;
    priorityTier: "hot" | "warm" | "cold" | "low";
    scoreBreakdown: {
        contactInfoScore: number;
        businessScaleScore: number;
        digitalPresenceScore: number;
        verificationScore: number;
    };
}

export function calculateLeadScore(lead: LeadData): ScoreResult {
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

    // Digital Presence (25 points max) — no website = high opportunity
    if (!lead.website) {
        digitalPresenceScore += 20;
    } else {
        if (!lead.websiteStatus?.hasHttps) digitalPresenceScore += 10;
        if (!lead.websiteStatus?.isMobileResponsive) digitalPresenceScore += 8;
        if ((lead.websiteStatus?.estimatedAge || 0) > 5) digitalPresenceScore += 7;
    }

    // Verification (20 points max)
    if (lead.registrationNumber) verificationScore += 10;
    if (lead.googleBusinessUrl) verificationScore += 5;
    if (lead.socialMedia.length > 0) verificationScore += 5;

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
