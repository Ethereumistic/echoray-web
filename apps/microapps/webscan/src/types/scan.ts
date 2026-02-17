export interface ScanRequest {
  url: string;
  userId: string;
  scanId: string;
  options?: {
    categories?: (
      | "performance"
      | "accessibility"
      | "best-practices"
      | "seo"
      | "pwa"
    )[];
    device?: "mobile" | "desktop";
  };
}

export interface ScanResult {
  scanId: string;
  url: string;
  timestamp: number;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa?: number;
  };
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
  };
  aiReadiness?: {
    structuredData: boolean;
    semanticHtml: boolean;
    imageAltTags: number;
    headingStructure: boolean;
  };
}

export interface QueueJob {
  id: string;
  data: ScanRequest;
  timestamp: number;
}
