import * as fs from "fs";
import * as path from "path";
import {
  LinkedinPostItem,
  LinkedinCompanyItem,
  LinkedinSearchOptions,
  LinkedinCompanySearchOptions,
} from "./linkedinTypes";

interface UnipileConfig {
  baseUrl: string;
  apiKey: string;
  accountId: string;
}

/**
 * Reads and cleans environment variables for Unipile from process.env or .env file fallback
 */
export function getUnipileConfig(): UnipileConfig {
  let baseUrl = process.env.UNIPILE_BASE_URL || "";
  let apiKey = process.env.UNIPILE_API_KEY || "";
  let accountId = process.env.UNIPILE_ACCOUNT_ID || "";

  // Fallback: Read from .env file if running in Node environment where dotenv isn't preloaded
  if (!apiKey || !accountId) {
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        const lines = content.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("#") || !trimmed.includes("=")) continue;
          const [rawKey, ...valParts] = trimmed.split("=");
          const key = rawKey.trim();
          const val = valParts.join("=").trim();

          if (key === "UNIPILE_BASE_URL" && !baseUrl) {
            baseUrl = val;
          } else if (key === "UNIPILE_API_KEY" && !apiKey) {
            apiKey = val;
          } else if (key === "UNIPILE_ACCOUNT_ID" && !accountId) {
            accountId = val;
          }
        }
      }
    } catch {
      // Ignore fs read error and proceed
    }
  }

  // Ensure default base URL if not set
  if (!baseUrl) {
    baseUrl = "https://api24.unipile.com:15468";
  }

  // Clean trailing slashes
  baseUrl = baseUrl.replace(/\/+$/, "");

  if (!apiKey) {
    throw new Error(
      "UNIPILE_API_KEY is not defined in environment variables or .env file. Please check your .env configuration."
    );
  }

  if (!accountId) {
    throw new Error(
      "UNIPILE_ACCOUNT_ID is not defined in environment variables or .env file. Please check your .env configuration."
    );
  }

  return {
    baseUrl,
    apiKey,
    accountId,
  };
}

/**
 * Execute LinkedIn search via Unipile API (Posts, People, Companies)
 */
export async function searchLinkedin(options: LinkedinSearchOptions) {
  const config = getUnipileConfig();
  const limit = options.limit || 10;

  const queryParams = new URLSearchParams({
    account_id: config.accountId,
    limit: limit.toString(),
  });

  if (options.cursor) {
    queryParams.append("cursor", options.cursor);
  }

  const endpoint = `${config.baseUrl}/api/v1/linkedin/search?${queryParams.toString()}`;

  // Build the request body payload
  const bodyPayload: Record<string, unknown> = {
    api: options.api || "classic",
    category: options.category || "posts",
    keywords: options.keywords || "",
  };

  if (options.sort_by) {
    bodyPayload.sort_by = options.sort_by;
  }

  if (options.date_posted) {
    bodyPayload.date_posted = options.date_posted;
  }

  if (options.content_type) {
    bodyPayload.content_type = options.content_type;
  }

  if (options.posted_by) {
    bodyPayload.posted_by = options.posted_by;
  }

  if (options.mentioning) {
    bodyPayload.mentioning = options.mentioning;
  }

  if (options.author) {
    bodyPayload.author = options.author;
  }

  const timeoutMs = options.timeoutMs || 25000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": config.apiKey,
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError: Record<string, unknown> | null = null;
      try {
        parsedError = JSON.parse(errorText);
      } catch {}

      const detail =
        (parsedError?.detail as string) ||
        (parsedError?.title as string) ||
        errorText;

      throw new Error(
        `Unipile LinkedIn Search failed (HTTP ${response.status}): ${detail}`
      );
    }

    return await response.json();
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Execute LinkedIn company search with keywords, location, and industry
 */
export async function searchLinkedinCompanies(
  options: LinkedinCompanySearchOptions
) {
  const config = getUnipileConfig();
  const limit = options.limit || 10;

  const queryParams = new URLSearchParams({
    account_id: config.accountId,
    limit: limit.toString(),
  });

  if (options.cursor) {
    queryParams.append("cursor", options.cursor);
  }

  const endpoint = `${config.baseUrl}/api/v1/linkedin/search?${queryParams.toString()}`;

  // Construct composite search keywords: combines keywords, location, and industry
  const keywordParts: string[] = [];
  if (options.keywords && options.keywords.trim()) {
    keywordParts.push(options.keywords.trim());
  }
  if (options.location && options.location.trim()) {
    keywordParts.push(options.location.trim());
  }
  if (options.industry && options.industry.trim()) {
    keywordParts.push(options.industry.trim());
  }

  const combinedKeywords = keywordParts.join(" ").trim() || "Technology Software";

  const bodyPayload: Record<string, unknown> = {
    api: options.api || "classic",
    category: "companies",
    keywords: combinedKeywords,
  };

  if (options.has_job_offers !== undefined) {
    bodyPayload.has_job_offers = options.has_job_offers;
  }

  const timeoutMs = options.timeoutMs || 25000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": config.apiKey,
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError: Record<string, unknown> | null = null;
      try {
        parsedError = JSON.parse(errorText);
      } catch {}

      const detail =
        (parsedError?.detail as string) ||
        (parsedError?.title as string) ||
        errorText;

      throw new Error(
        `Unipile LinkedIn Company Search failed (HTTP ${response.status}): ${detail}`
      );
    }

    return await response.json();
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Fallback generator for realistic LinkedIn posts for demo/offline resilience
 */
export function generateFallbackLinkedinPosts(
  keywords: string
): LinkedinPostItem[] {
  const query = keywords.trim() || "AI Agents & SaaS";
  return [
    {
      type: "POST",
      provider: "LINKEDIN",
      id: "7500518218026078208",
      social_id: "urn:li:ugcPost:7500518218026078208",
      text: `📢 Looking for an AI receptionist that answers your business calls 24/7? Let’s work together — check out our latest architecture for ${query}.\n\nAt Call Agent Studio, we build AI voice agents for fast-growing businesses. Our AI receptionists answer calls around the clock, qualify leads, and follow your business rules seamlessly.\n\n#OpenForBusiness #AIVoiceAgents #VoiceAI #AIReceptionist #BusinessAutomation`,
      date: "2h",
      parsed_datetime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      reaction_counter: 28,
      comment_counter: 12,
      repost_counter: 4,
      impressions_counter: 1450,
      author: {
        id: "author_1",
        public_identifier: "mubeen-asad",
        name: "Mubeen Asad",
        is_company: false,
        headline: "Founder at Call Agent Studio | AI Voice Agents & LLM Systems",
        profile_picture_url:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      },
      permissions: {
        can_react: true,
        can_post_comments: true,
        can_share: true,
      },
      share_url:
        "https://www.linkedin.com/posts/mubeen-asad_openforbusiness-aivoiceagents-voiceai",
      is_repost: false,
      attachments: [],
      mentions: [],
    },
    {
      type: "POST",
      provider: "LINKEDIN",
      id: "7500517415378894849",
      social_id: "urn:li:activity:7500517415378894849",
      text: `Hiring: Lead AI Architect & Enterprise Solutions Consultant (100% Remote)\n\nAre you looking to bridge the gap between enterprise data science, LLM evaluation, and production software regarding ${query}?\n\nWe're hiring a leader to build scalable agentic AI workflows and evaluate production reasoning pipelines.\n\nCompensation: Competitive Base + Equity.\nDrop me a DM or check out the link to apply! 👇`,
      date: "5h",
      parsed_datetime: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      reaction_counter: 45,
      comment_counter: 8,
      repost_counter: 6,
      impressions_counter: 3200,
      author: {
        id: "author_2",
        public_identifier: "laciemarshall",
        name: "Lacie Marshall",
        is_company: false,
        headline: "CEO & Talent Partner | Technical AI Executive Recruiting",
        profile_picture_url:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      },
      permissions: {
        can_react: true,
        can_post_comments: true,
        can_share: true,
      },
      share_url: "https://www.linkedin.com/posts/laciemarshall_hiring-ai-architect",
      is_repost: false,
      attachments: [],
      mentions: [],
      job_posting: {
        id: "4461299470",
        title: "Lead AI Architect & Enterprise Solutions Consultant",
        location: "United States (Remote)",
        company: {
          id: "comp_1",
          name: "Onward AI Labs",
          picture_url:
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
        },
      },
    },
    {
      type: "POST",
      provider: "LINKEDIN",
      id: "7497510147716530176",
      social_id: "urn:li:ugcPost:7497510147716530176",
      text: `AI agents are moving fast from experiments to production for ${query}. One architectural question keeps coming up in every conversation with engineering leaders:\n\n1. Do you go with one powerful generalist agent that handles everything?\n2. Or a specialized fleet of micro-agents working together in a supervisor-worker mesh?\n\nWe'd love to hear where your team stands! 👇\n\n#AIAgents #ArtificialIntelligence #MultiAgentSystems #EnterpriseAI #TechLeadership`,
      date: "1d",
      parsed_datetime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      reaction_counter: 112,
      comment_counter: 34,
      repost_counter: 15,
      impressions_counter: 7800,
      author: {
        id: "author_3",
        public_identifier: "azirotech",
        name: "Aziro Tech",
        is_company: true,
        headline: "Enterprise AI & Scalable Cloud Solutions Provider",
        profile_picture_url:
          "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&auto=format&fit=crop&q=80",
      },
      permissions: {
        can_react: true,
        can_post_comments: true,
        can_share: true,
      },
      share_url: "https://www.linkedin.com/posts/azirotech_multiagent-systems",
      is_repost: false,
      attachments: [],
      mentions: [],
    },
  ];
}

/**
 * Fallback generator for realistic LinkedIn companies for demo/offline resilience
 */
export function generateFallbackLinkedinCompanies(
  keywords: string,
  location?: string,
  industry?: string
): LinkedinCompanyItem[] {
  const loc = location || "San Francisco, CA";
  const ind = industry || "IT Services and IT Consulting";
  const kw = keywords || "AI Software";

  return [
    {
      type: "COMPANY",
      id: "comp_fb_1",
      name: `${kw.replace(/OR.*$/, "").trim()} Intelligence Labs`,
      profile_url: "https://www.linkedin.com/company/ai-intelligence-labs",
      summary: `Leading enterprise software company in ${loc} specializing in next-generation automated intelligence, custom software engineering, and cloud workflows for ${ind}.`,
      industry: ind,
      location: loc,
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      followers_count: 54200,
    },
    {
      type: "COMPANY",
      id: "comp_fb_2",
      name: `ScaleVector Technologies`,
      profile_url: "https://www.linkedin.com/company/scalevector-tech",
      summary: `ScaleVector provides enterprise ${kw} infrastructure, developer APIs, and high-performance pipeline tools helping organizations scale from seed to IPO.`,
      industry: "Software Development",
      location: loc,
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop&q=80",
      followers_count: 89100,
    },
    {
      type: "COMPANY",
      id: "comp_fb_3",
      name: `Apex Signal Dynamics`,
      profile_url: "https://www.linkedin.com/company/apex-signal-dynamics",
      summary: `Pioneering autonomous signal intelligence, real-time prospect discovery, and B2B workflow integrations. Serving Fortune 500 enterprises across ${loc}.`,
      industry: ind,
      location: loc,
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80",
      followers_count: 32400,
    },
  ];
}
