import { SYSTEM_PROMPT, AdvancedSearchAiResponse } from "@/../data/SYSTEM_PROMPT";
import { getOpenAiApiKey } from "./aiCompetitorAnalyzer";

export interface QueryFilterOptions {
  excludeLinks?: boolean;
  excludeRetweets?: boolean;
  englishOnly?: boolean;
  excludeHiring?: boolean;
  minFaves?: number;
  minReplies?: number;
  sinceDate?: string;
  targetAccount?: string;
}

/**
 * Intelligent heuristic fallback for generating advanced search queries
 * when OpenAI is unavailable or errors out. Follows Playbooks A, B, C, D strictly.
 */
export function generateAdvancedQueryHeuristic(
  userInput: string,
  options?: QueryFilterOptions
): AdvancedSearchAiResponse {
  const inputLower = userInput.toLowerCase();

  // Determine standard filters
  const filters: string[] = [];
  const appliedFilterDescriptions: string[] = [];

  const excludeLinks = options?.excludeLinks !== false;
  const excludeRetweets = options?.excludeRetweets !== false;
  const englishOnly = options?.englishOnly !== false;
  const excludeHiring = options?.excludeHiring !== false;

  if (excludeLinks) {
    filters.push("-filter:links");
    appliedFilterDescriptions.push("-filter:links to strip blog shares and promotional spam");
  }
  if (excludeRetweets) {
    filters.push("-is:retweet");
    appliedFilterDescriptions.push("-is:retweet to isolate original author posts");
  }
  if (englishOnly) {
    filters.push("lang:en");
    appliedFilterDescriptions.push("lang:en to restrict to English language tweets");
  }
  if (excludeHiring) {
    filters.push("-job -hiring");
    appliedFilterDescriptions.push("-job -hiring to filter out recruiters and job postings");
  }
  if (options?.minFaves && options.minFaves > 0) {
    filters.push(`min_faves:${options.minFaves}`);
    appliedFilterDescriptions.push(`min_faves:${options.minFaves} for engagement filtering`);
  }
  if (options?.sinceDate) {
    filters.push(`since:${options.sinceDate}`);
    appliedFilterDescriptions.push(`since:${options.sinceDate} for time boundary`);
  }

  const defaultFilterString = filters.join(" ");

  // Extract competitor handles or names if present
  const handleMatches = userInput.match(/@([a-zA-Z0-9_]+)/g) || [];
  const handles = handleMatches.map((h) => h.replace("@", ""));

  // Check Playbook D: Investor / Funding Discovery
  const isInvestorIntent =
    inputLower.includes("invest") ||
    inputLower.includes("vc") ||
    inputLower.includes("angel") ||
    inputLower.includes("pitch") ||
    inputLower.includes("deck") ||
    inputLower.includes("pre-seed") ||
    inputLower.includes("funding") ||
    inputLower.includes("deal flow");

  // Check Playbook A: Competitor Switching & Frustration
  const isCompetitorSwitching =
    handles.length > 0 ||
    inputLower.includes("switch") ||
    inputLower.includes("alternative") ||
    inputLower.includes("cancel") ||
    inputLower.includes("canceling") ||
    inputLower.includes("hate") ||
    inputLower.includes("sucks") ||
    inputLower.includes("expensive") ||
    inputLower.includes("overpriced") ||
    inputLower.includes("bad support") ||
    inputLower.includes("broken") ||
    inputLower.includes("leaving") ||
    inputLower.includes("vs ");

  // Check Playbook C: Problem / Pain-Point Discovery
  const isPainPointIntent =
    inputLower.includes("struggling with") ||
    inputLower.includes("spending too much") ||
    inputLower.includes("spending hours") ||
    inputLower.includes("hate doing") ||
    inputLower.includes("how do you automate") ||
    inputLower.includes("sick of") ||
    inputLower.includes("manual") ||
    inputLower.includes("pain point");

  // Default: Playbook B (Tool recommendations) or specific matched playbook
  if (isInvestorIntent) {
    let techKeywords = '("AI" OR "SaaS" OR "pre-seed" OR "seed" OR "B2B")';
    if (inputLower.includes("ai") || inputLower.includes("llm")) {
      techKeywords = '("AI" OR "LLM" OR "AI agents" OR "machine learning")';
    } else if (inputLower.includes("fintech")) {
      techKeywords = '("Fintech" OR "payments" OR "banking")';
    } else if (inputLower.includes("b2b")) {
      techKeywords = '("B2B SaaS" OR "enterprise" OR "seed")';
    }

    const generatedQuery = `("looking to invest" OR "send me your deck" OR "investing in" OR "DM your pitch" OR "open office hours") ${techKeywords} ${defaultFilterString}`.trim();

    return {
      searchIntent: `Discover active investors, angels, and VCs soliciting pitch decks and open deal flow for ${userInput}`,
      searchStrategy: "Playbook D",
      generatedQuery,
      appliedFilters: appliedFilterDescriptions,
      proTip: "Reach out with a 2-sentence traction snapshot and deck link under their tweet within 3 hours of posting.",
    };
  }

  if (isCompetitorSwitching) {
    // Extract competitor name keywords
    let competitorTerms = "";
    if (handles.length > 0) {
      competitorTerms = handles
        .map((h) => `"${h}" OR @${h}`)
        .join(" OR ");
    } else {
      // Look for common keywords
      const commonCompetitors = ["hubspot", "apollo", "salesforce", "outreach", "zoominfo", "notion", "airtable", "jira", "stripe", "clay", "loom"];
      const matched = commonCompetitors.filter((c) => inputLower.includes(c));
      if (matched.length > 0) {
        competitorTerms = matched.map((m) => `"${m}" OR @${m}`).join(" OR ");
      } else {
        const words = userInput.split(/\s+/).filter((w) => w.length > 3 && !["find", "people", "looking", "about", "with", "from"].includes(w.toLowerCase()));
        competitorTerms = words.slice(0, 2).map((w) => `"${w}"`).join(" OR ");
      }
    }

    const generatedQuery = `(${competitorTerms}) ("alternative" OR "switching from" OR "canceling" OR "cancel" OR "too expensive" OR "bad support" OR "broken") ${defaultFilterString}`.trim();

    return {
      searchIntent: `Surface dissatisfied users and churn signals targeting ${competitorTerms.replace(/"/g, "")}`,
      searchStrategy: "Playbook A",
      generatedQuery,
      appliedFilters: appliedFilterDescriptions,
      proTip: "Reply by empathizing with their specific complaint and offer a seamless migration or demo link.",
    };
  }

  if (isPainPointIntent) {
    const cleanTopic = userInput
      .replace(/find|people|struggling|with|spending|hours|on|hate|doing|manual/gi, "")
      .trim();

    const topicQuery = cleanTopic ? `("${cleanTopic}")` : `("cold emailing" OR "prospecting" OR "data scraping")`;
    const generatedQuery = `("spending hours on" OR "hate doing" OR "how do you manage" OR "sick of manually" OR "struggling with") ${topicQuery} ${defaultFilterString}`.trim();

    return {
      searchIntent: `Uncover users facing daily manual friction regarding ${cleanTopic || "workflow tasks"}`,
      searchStrategy: "Playbook C",
      generatedQuery,
      appliedFilters: appliedFilterDescriptions,
      proTip: "Ask how they currently solve it before pitching; lead with tactical educational advice.",
    };
  }

  // Playbook B (Direct Tool Recommendations - High Buying Intent)
  const cleanCategory = userInput
    .replace(/find|buyers|people|asking|for|recommendations|tool|software|suggestions|best/gi, "")
    .trim();

  const categoryTerms = cleanCategory
    ? `("${cleanCategory}" OR "${cleanCategory} software" OR "${cleanCategory} tool")`
    : `("lead generation" OR "prospecting" OR "CRM" OR "outbound sales")`;

  const generatedQuery = `("anyone recommend" OR "looking for a tool" OR "what do you use for" OR "best software for" OR "best alternative to") ${categoryTerms} ${defaultFilterString}`.trim();

  return {
    searchIntent: `Target prospects actively asking their Twitter network for ${cleanCategory || "software"} recommendations`,
    searchStrategy: "Playbook B",
    generatedQuery,
    appliedFilters: appliedFilterDescriptions,
    proTip: "Drop a concise 1-sentence value proposition explaining why your solution solves their specific use case.",
  };
}

/**
 * Execute AI Advanced Query Generation using OpenAI API with the specialized SYSTEM_PROMPT.
 * Automatically falls back to high-fidelity heuristic generator if OpenAI is unavailable.
 */
export async function generateAdvancedSearchQuery(
  userInput: string,
  options?: QueryFilterOptions
): Promise<{
  result: AdvancedSearchAiResponse;
  source: "openai" | "fallback";
}> {
  const apiKey = getOpenAiApiKey();

  if (!apiKey || apiKey.trim() === "") {
    return {
      result: generateAdvancedQueryHeuristic(userInput, options),
      source: "fallback",
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const userPrompt = `User Natural Language Request:
"${userInput}"

Active Custom Filter Constraints (if any):
- Exclude Links: ${options?.excludeLinks !== false}
- Exclude Retweets: ${options?.excludeRetweets !== false}
- English Language Only: ${options?.englishOnly !== false}
- Exclude Job/Hiring Spam: ${options?.excludeHiring !== false}
${options?.minFaves ? `- Minimum Likes: min_faves:${options.minFaves}` : ""}
${options?.minReplies ? `- Minimum Replies: min_replies:${options.minReplies}` : ""}
${options?.sinceDate ? `- Date Boundary: since:${options.sinceDate}` : ""}
${options?.targetAccount ? `- Target Account: to:${options.targetAccount} or @${options.targetAccount}` : ""}

Please convert this request into an optimized Twitter/X boolean query following the SYSTEM PROMPT rules and the appropriate playbook (Playbook A, B, C, or D). Return strictly JSON matching the specified schema.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn("OpenAI advanced search call failed, using heuristic fallback:", await response.text());
      return {
        result: generateAdvancedQueryHeuristic(userInput, options),
        source: "fallback",
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed: Partial<AdvancedSearchAiResponse> = JSON.parse(content || "{}");

    if (parsed.generatedQuery && parsed.searchStrategy) {
      return {
        result: {
          searchIntent: parsed.searchIntent || "Custom lead discovery query",
          searchStrategy: parsed.searchStrategy || "Playbook B",
          generatedQuery: parsed.generatedQuery,
          appliedFilters: Array.isArray(parsed.appliedFilters) ? parsed.appliedFilters : ["-filter:links", "-is:retweet", "lang:en", "-job -hiring"],
          proTip: parsed.proTip || "Engage quickly with personalized value.",
        },
        source: "openai",
      };
    }

    return {
      result: generateAdvancedQueryHeuristic(userInput, options),
      source: "fallback",
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    console.warn("Error calling OpenAI advanced search, using heuristic fallback:", error);
    return {
      result: generateAdvancedQueryHeuristic(userInput, options),
      source: "fallback",
    };
  }
}
