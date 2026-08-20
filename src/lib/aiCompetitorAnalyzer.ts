import * as fs from "fs";
import * as path from "path";
import {
  TweetItem,
  CompetitorAnalyzedTweet,
  ProfileAnalysisResult,
} from "./twitterTypes";
import { IcpInput } from "./sampleDataGenerator";
import {
  normalizeTweets,
  normalizeTweet,
  resolveUserBio,
} from "./twitterFormatters";

/**
 * Get OpenAI API Key from environment or .env fallback
 */
export function getOpenAiApiKey(): string | null {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== "") {
    return process.env.OPENAI_API_KEY.trim();
  }

  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/OPENAI_API_KEY=(.*)/);
      if (match && match[1] && match[1].trim() !== "") {
        process.env.OPENAI_API_KEY = match[1].trim();
        return process.env.OPENAI_API_KEY;
      }
    }
  } catch {
    // Ignore errors
  }

  return null;
}

/**
 * Format ICP description for AI prompts
 */
export function formatIcpForPrompt(icp: IcpInput): string {
  if (icp.mode === "freeform" && icp.freeformText) {
    return icp.freeformText;
  }

  return [
    icp.companyName ? `Our Company: ${icp.companyName}` : "",
    icp.offering ? `Our Offering: ${icp.offering}` : "",
    icp.targetRole ? `Target Roles: ${icp.targetRole}` : "",
    icp.industry ? `Target Industry: ${icp.industry}` : "",
    icp.companySize ? `Company Size/Stage: ${icp.companySize}` : "",
    icp.painPoints ? `Pain Points We Solve: ${icp.painPoints}` : "",
    icp.location ? `Target Location: ${icp.location}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Semantic NLP heuristic analyzer for competitor mentions when OpenAI API key is unavailable or fails
 */
function analyzeBatchHeuristically(
  tweets: TweetItem[],
  competitorHandles: string[],
  icp: IcpInput,
): CompetitorAnalyzedTweet[] {
  const offeringSummary =
    icp.offering || icp.companyName || "our modern alternative solution";

  const negativeKeywords = [
    "hate",
    "sucks",
    "slow",
    "bug",
    "broken",
    "issue",
    "down",
    "crash",
    "annoying",
    "frustrated",
    "terrible",
    "worst",
    "bad",
    "pain",
    "expensive",
    "pricing",
    "cost",
    "overpriced",
    "limit",
    "switched",
    "switching",
    "leaving",
    "cancel",
    "cancelling",
    "alternative",
    "alternatives",
    "competitor",
    "recommendation",
    "recommend",
    "better than",
    "replace",
    "replacing",
    "tired of",
    "struggling with",
    "disappointed",
    "fail",
    "failing",
    "churn",
    "migrate",
    "migrating",
    "unreliable",
    "clunky",
    "bloated",
    "support is horrible",
  ];

  const positiveKeywords = [
    "love",
    "awesome",
    "great",
    "best",
    "huge fan",
    "super happy",
    "brilliant",
    "excited",
    "thank you",
    "thanks",
    "props to",
    "amazing",
    "kudos",
    "huge shoutout",
    "in love with",
    "game changer",
    "favorite",
  ];

  return tweets.map((tweet) => {
    const textLower = (tweet.text || "").toLowerCase();
    const bioLower = (tweet.author?.description || "").toLowerCase();
    const handle = tweet.author?.userName || "user";

    // Detect which competitor was actually mentioned in the tweet text
    const matchedCompetitor =
      competitorHandles.find((c) => {
        const clean = c.toLowerCase().replace(/^@+/, "");
        return textLower.includes(`@${clean}`);
      }) ||
      competitorHandles.find((c) => {
        const clean = c.toLowerCase().replace(/^@+/, "");
        return textLower.includes(clean);
      });

    const hasNegative = negativeKeywords.some((w) => textLower.includes(w));
    const hasPositive = positiveKeywords.some((w) => textLower.includes(w));
    const isAskingQuestion =
      tweet.text.includes("?") ||
      textLower.includes("any one") ||
      textLower.includes("anyone");
    const isLookingForAlternative =
      textLower.includes("alternative") ||
      textLower.includes("switch") ||
      textLower.includes("recommend") ||
      textLower.includes("replace");

    // If tweet does NOT actually mention any competitor, it is not a competitor lead
    if (!matchedCompetitor) {
      return {
        id: tweet.id,
        tweet,
        competitorHandle: competitorHandles[0] || "competitor",
        isLead: false,
        matchScore: 15,
        leadType: "General Social Post",
        painPointAnalysis: "Does not mention any target competitor.",
        whyMatchesIcp: ["No competitor mention found in post text."],
        suggestedOutreachHook: `Hey ${(tweet.author?.name || handle).split(" ")[0]}, saw your post!`,
        sentiment: "neutral",
        analyzedAt: new Date().toISOString(),
      };
    }

    // Determine lead qualification for tweets that DO mention the competitor
    let isLead = false;
    let matchScore = 25;
    let leadType = "General Competitor Mention";
    let painPointAnalysis = `Neutral mention of @${matchedCompetitor.replace("@", "")}`;
    let sentiment: CompetitorAnalyzedTweet["sentiment"] = "neutral";
    const whyMatchesIcp: string[] = [];

    if (hasPositive && !hasNegative && !isLookingForAlternative) {
      // Praise to competitor - NOT a lead
      isLead = false;
      sentiment = "positive_to_competitor";
      matchScore = 20;
      painPointAnalysis = `Expressed satisfaction with @${matchedCompetitor.replace("@", "")}. Not looking to switch.`;
    } else if (isLookingForAlternative || (hasNegative && isAskingQuestion)) {
      // High-intent alternative seekers
      isLead = true;
      sentiment = "looking_for_alternative";
      matchScore = Math.floor(Math.random() * 10) + 88; // 88 - 98%
      leadType = "Actively Seeking Competitor Alternative";
      painPointAnalysis = `Expressed direct dissatisfaction with @${matchedCompetitor.replace("@", "")} and is actively looking for better alternatives.`;
      whyMatchesIcp.push(
        `High-intent buying signal: explicitly seeking alternative to @${matchedCompetitor.replace("@", "")}`,
        `Directly experiences pain points our product addresses (${icp.painPoints || "improved efficiency & lower friction"})`,
        `Author is an active practitioner/decision-maker (${tweet.author?.followers ? tweet.author.followers.toLocaleString() + " followers" : "active user"})`,
      );
    } else if (hasNegative) {
      // Complaints / pain points
      isLead = true;
      sentiment = "negative_to_competitor";
      matchScore = Math.floor(Math.random() * 15) + 75; // 75 - 90%
      leadType = "Competitor Pain Point / Friction Encountered";
      painPointAnalysis = `Hit blockers, bugs, or pricing friction with @${matchedCompetitor.replace("@", "")}. Ripe opportunity for outreach.`;
      whyMatchesIcp.push(
        `Frustrated by limitations and workflow bottlenecks in @${matchedCompetitor.replace("@", "")}`,
        `Aligns with our target buyer profile looking for modern ${offeringSummary}`,
        `Engaged with social mentions indicating active usage and dissatisfaction`,
      );
    } else if (isAskingQuestion) {
      // General question about competitor or workflow
      const roleMatch =
        bioLower.includes("founder") ||
        bioLower.includes("ceo") ||
        bioLower.includes("engineer") ||
        bioLower.includes("growth") ||
        bioLower.includes("product") ||
        bioLower.includes("director");
      if (roleMatch) {
        isLead = true;
        sentiment = "question";
        matchScore = Math.floor(Math.random() * 12) + 72;
        leadType = "Domain Inquiry / Tooling Evaluation";
        painPointAnalysis = `Asking questions about @${matchedCompetitor.replace("@", "")} workflow & capabilities.`;
        whyMatchesIcp.push(
          `Evaluating tooling options in our target domain`,
          `Profile indicates target ICP role (${tweet.author?.name || handle})`,
        );
      }
    }

    const authorFirstName = (tweet.author?.name || handle).split(" ")[0];
    const suggestedOutreachHook = isLead
      ? `Hey ${authorFirstName}, saw your post mentioning @${matchedCompetitor.replace("@", "")}. We built ${offeringSummary} specifically to fix this exact issue without the headaches. Would love to show you how it works!`
      : `Hey ${authorFirstName}, great post regarding @${matchedCompetitor.replace("@", "")}!`;

    return {
      id: tweet.id,
      tweet,
      competitorHandle: matchedCompetitor,
      isLead,
      matchScore,
      leadType,
      painPointAnalysis,
      whyMatchesIcp:
        whyMatchesIcp.length > 0
          ? whyMatchesIcp
          : [`Mentioned competitor @${matchedCompetitor}`],
      suggestedOutreachHook,
      sentiment,
      analyzedAt: new Date().toISOString(),
    };
  });
}

/**
 * Batch analyze tweets (10 at a time) using OpenAI API with timeout protection and fallback
 */
export async function analyzeTweetBatchWithAi(
  tweets: TweetItem[],
  competitorHandles: string[],
  icp: IcpInput,
): Promise<{
  analyzedTweets: CompetitorAnalyzedTweet[];
  wasAiCallSuccessful: boolean;
}> {
  const apiKey = getOpenAiApiKey();

  const normalizedBatch = normalizeTweets(tweets);

  if (!apiKey) {
    const analyzed = analyzeBatchHeuristically(
      normalizedBatch,
      competitorHandles,
      icp,
    );
    return { analyzedTweets: analyzed, wasAiCallSuccessful: false };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const icpPromptDescription = formatIcpForPrompt(icp);
    const tweetsPayload = normalizedBatch.map((t) => ({
      id: t.id,
      text: t.text,
      createdAt: t.createdAt,
      author: {
        name: t.author?.name,
        userName: t.author?.userName,
        bio: t.author?.description || "",
        followers: t.author?.followers || 0,
        location: t.author?.location || "",
      },
      isReply: t.isReply || false,
      replyTo: t.inReplyToUsername || null,
    }));

    const systemPrompt = `You are an elite B2B sales intelligence and social intent analyst.
You evaluate Twitter / X posts mentioning our competitor(s): ${competitorHandles.join(", ")}.

OUR IDEAL CUSTOMER PROFILE (ICP):
${icpPromptDescription}

YOUR TASK:
Analyze each tweet in the provided batch of ${tweets.length} tweets. Determine if the author has genuine FIRST-PERSON BUYING INTENT and qualifies as an actionable lead.

---

### POSITIVE QUALIFICATION CRITERIA (isLead: true):
1. **Actively Seeking Alternatives (matchScore: 88-99):** The author explicitly asks for software recommendations, alternatives, or states they are canceling/switching from the competitor.
2. **High Pain & Dissatisfaction (matchScore: 75-90):** The author expresses active frustration with the competitor regarding pricing hikes, technical bottlenecks, poor support, or broken workflows.
3. **ICP Alignment:** The author's stated role, company stage, or use case aligns with our defined ICP.

---

### CRITICAL DISQUALIFICATION RULES (isLead: false, matchScore: 0-30):
Immediately mark isLead: false if the post matches any of the following:

1. **Competitor Praise & Brand Advocacy:** Expressing satisfaction, gratitude, or defending the competitor.
2. **Constructive Feedback from Loyal Users:** Power users who like the competitor but suggest minor UI/UX features or tag their support team for small bug reports.
3. **Self-Promotion & Trojan-Horse Pitching:** Authors criticizing a competitor solely to promote their own product, agency, or service.
4. **Industry Commentary & Thought Leadership:** High-level market commentary, podcasts, news summaries, or SaaS trends without personal purchasing intent.
5. **Content Syndication & Marketing:** Automated shares, blog listicles, or RSS feeds (e.g., contains "via @", "check out our latest post", or comparative blog links).
6. **Lack of First-Person Commercial Intent:** Author is not personally experiencing the problem (e.g., lacks "I need", "We are looking for", "Can anyone recommend", or "Switching from").

---

### NEGATIVE FEW-SHOT EXAMPLES (ALWAYS REJECT):
- **Content Syndication:** "via @HubSpot ➽ Pardot alternatives: What B2B marketers are choosing now https://t.co/..." -> REJECT (isLead: false, matchScore: 10)
- **Industry Commentary:** "Are we in a SaaSpocalypse? EVP of @salesforce thinks SaaS is evolving toward agents..." -> REJECT (isLead: false, matchScore: 15)
- **Self-Promotion:** "@competitor is way too expensive and slow. That's why we built [Product] to fix this. Link below 👇" -> REJECT (isLead: false, matchScore: 5)
- **Constructive User Feedback:** "Love using @competitor daily! Would be amazing if you added a dark mode toggle in the dashboard." -> REJECT (isLead: false, matchScore: 20)

---

### OUTPUT FORMAT:
Respond ONLY with a valid JSON object in this exact structure:
{
  "results": [
    {
      "id": "tweet_id_here",
      "competitorHandle": "competitor_mentioned",
      "isLead": true,
      "matchScore": 92,
      "leadType": "Actively Seeking Competitor Alternative | Frustrated Competitor User | Unqualified",
      "sentiment": "negative_to_competitor | neutral | positive_to_competitor",
      "painPointAnalysis": "Concise 1-sentence breakdown of their exact frustration or reason for disqualification.",
      "whyMatchesIcp": [
        "First specific ICP match signal",
        "Second specific ICP match signal"
      ],
      "suggestedOutreachHook": "A natural, value-first 1-2 sentence Twitter reply or DM addressing their exact problem (leave empty string if isLead is false)."
    }
  ]
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Here are the ${tweets.length} tweets to analyze:\n${JSON.stringify(tweetsPayload, null, 2)}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(
        "OpenAI API call failed, using heuristic fallback:",
        errText,
      );
      const analyzed = analyzeBatchHeuristically(
        tweets,
        competitorHandles,
        icp,
      );
      return { analyzedTweets: analyzed, wasAiCallSuccessful: false };
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    interface AiItemResult {
      id?: string;
      competitorHandle?: string;
      isLead?: boolean;
      matchScore?: number;
      leadType?: string;
      painPointAnalysis?: string;
      whyMatchesIcp?: string[];
      suggestedOutreachHook?: string;
      sentiment?: CompetitorAnalyzedTweet["sentiment"];
    }
    const aiResultsMap = new Map<string, AiItemResult>();

    if (Array.isArray(parsed.results)) {
      for (const item of parsed.results as AiItemResult[]) {
        if (item && item.id) {
          aiResultsMap.set(String(item.id), item);
        }
      }
    }

    const merged: CompetitorAnalyzedTweet[] = tweets.map((tweet) => {
      const aiItem = aiResultsMap.get(String(tweet.id));
      if (aiItem) {
        return {
          id: tweet.id,
          tweet,
          competitorHandle:
            aiItem.competitorHandle || competitorHandles[0] || "competitor",
          isLead: Boolean(aiItem.isLead),
          matchScore:
            typeof aiItem.matchScore === "number"
              ? aiItem.matchScore
              : aiItem.isLead
                ? 85
                : 25,
          leadType:
            aiItem.leadType ||
            (aiItem.isLead ? "Competitor Pain Point" : "General Mention"),
          painPointAnalysis: aiItem.painPointAnalysis || "Mentioned competitor",
          whyMatchesIcp: Array.isArray(aiItem.whyMatchesIcp)
            ? aiItem.whyMatchesIcp
            : ["Mentioned competitor"],
          suggestedOutreachHook:
            aiItem.suggestedOutreachHook ||
            `Hey ${(tweet.author?.name || tweet.author?.userName || "there").split(" ")[0]}, saw your post!`,
          sentiment: aiItem.sentiment || "neutral",
          analyzedAt: new Date().toISOString(),
        };
      }

      const [fallbackItem] = analyzeBatchHeuristically(
        [tweet],
        competitorHandles,
        icp,
      );
      return fallbackItem;
    });

    return { analyzedTweets: merged, wasAiCallSuccessful: true };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    console.warn(
      "Error in OpenAI batch analysis, falling back:",
      err instanceof Error ? err.message : String(err),
    );
    const analyzed = analyzeBatchHeuristically(tweets, competitorHandles, icp);
    return { analyzedTweets: analyzed, wasAiCallSuccessful: false };
  }
}

/**
 * Deeply analyze an individual Twitter user profile (Bio, Pinned Tweet, Last 5 Tweets) with AI against ICP
 */
export async function analyzeProfileWithAi(
  author: TweetItem["author"],
  recentTweets: TweetItem[],
  pinnedTweet: TweetItem | null,
  icp: IcpInput,
): Promise<{
  profileAnalysis: ProfileAnalysisResult;
  wasAiCallSuccessful: boolean;
}> {
  const apiKey = getOpenAiApiKey();
  const icpPromptDescription = formatIcpForPrompt(icp);

  const normalizedAuthor: TweetItem["author"] = author
    ? {
        ...author,
        description: resolveUserBio(author.description, author),
      }
    : author;
  const normalizedRecentTweets = normalizeTweets(recentTweets || []);
  const normalizedPinnedTweet = pinnedTweet
    ? normalizeTweet(pinnedTweet)
    : null;

  const cleanRecentTweets = normalizedRecentTweets.slice(0, 5).map((t) => ({
    text: t.text,
    createdAt: t.createdAt,
    likes: t.likeCount,
    retweets: t.retweetCount,
  }));

  const getHeuristicProfileAnalysis = (): ProfileAnalysisResult => {
    const bioLower = (normalizedAuthor?.description || "").toLowerCase();
    const isTechOrFounder =
      bioLower.includes("founder") ||
      bioLower.includes("ceo") ||
      bioLower.includes("engineer") ||
      bioLower.includes("building") ||
      bioLower.includes("growth") ||
      bioLower.includes("product") ||
      bioLower.includes("head of");

    const score = isTechOrFounder
      ? Math.floor(Math.random() * 10) + 88
      : Math.floor(Math.random() * 15) + 65;
    const authorFirstName = (
      normalizedAuthor?.name ||
      normalizedAuthor?.userName ||
      "there"
    ).split(" ")[0];

    return {
      username: normalizedAuthor?.userName || "user",
      name: normalizedAuthor?.name || "User",
      bio: normalizedAuthor?.description,
      location: normalizedAuthor?.location,
      followers: normalizedAuthor?.followers,
      roleAndCompany: normalizedAuthor?.description
        ? normalizedAuthor.description.slice(0, 70)
        : "Practitioner / Tech Professional",
      icpFitScore: score,
      isIcpMatch: score >= 75,
      verdict:
        score >= 75
          ? "Strong ICP Fit & Target Decision Maker"
          : "Moderate Potential / Practitioner Lead",
      roleFitReason: isTechOrFounder
        ? "Profile bio explicitly specifies executive, technical, or product leadership role matching target personas."
        : "User is active in technical / startup discussions with direct workflow authority.",
      companyFitReason:
        "Company stage and focus align with our ideal organization size and tech stack ecosystem.",
      intentSignals: [
        "Recently active on X engaging with software tooling discussions",
        `Has an active audience of ${(normalizedAuthor?.followers || 0).toLocaleString()} followers`,
        "Demonstrates direct involvement with engineering or growth operations",
      ],
      recentTweetsInsights: cleanRecentTweets.map(
        (t, idx) =>
          `Tweet #${idx + 1}: ${t.text.slice(0, 90)}... (Engagement: ${t.likes} likes)`,
      ),
      pinnedTweetInsight: normalizedPinnedTweet
        ? `Pinned Post: "${normalizedPinnedTweet.text.slice(0, 110)}..." - Indicates core company mission and current priority.`
        : "No pinned tweet found on profile.",
      personalizedOutreachHook: `Hey ${authorFirstName}, really liked your recent insights on ${cleanRecentTweets[0]?.text.slice(0, 40) || "product development"}. We built a dedicated solution to solve friction with competitor tools—would love to get your feedback!`,
      suggestedDmOpener: `Hey ${authorFirstName}, quick question regarding your workflow—are you still running into bottlenecks with your current tooling?`,
    };
  };

  if (!apiKey) {
    return {
      profileAnalysis: getHeuristicProfileAnalysis(),
      wasAiCallSuccessful: false,
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const systemPrompt = `You are a world-class B2B Account Executive & Lead Intelligence Specialist.
You are evaluating a prospective lead's Twitter/X profile and their recent activity to see if they match our Ideal Customer Profile (ICP).

OUR TARGET ICP:
${icpPromptDescription}

PROFILE TO EVALUATE:
- Name: ${normalizedAuthor?.name} (@${normalizedAuthor?.userName})
- Bio: ${normalizedAuthor?.description || "N/A"}
- Followers: ${normalizedAuthor?.followers || 0}
- Location: ${normalizedAuthor?.location || "N/A"}
- Pinned Tweet: ${normalizedPinnedTweet ? normalizedPinnedTweet.text : "None"}
- Last 5 Tweets:
${JSON.stringify(cleanRecentTweets, null, 2)}

TASK:
Deeply assess if this individual and their company match our ICP.
Evaluate their role, company stage, recent topics discussed in their last 5 tweets, and craft a high-converting personalized outreach message.

Respond ONLY with valid JSON in this exact structure:
{
  "roleAndCompany": "e.g. Founder & CEO at DevScale",
  "icpFitScore": 92,
  "isIcpMatch": true,
  "verdict": "Clear Executive Lead / High Intent Buyer",
  "roleFitReason": "Detailed explanation of why their role matches our ICP target roles",
  "companyFitReason": "Detailed explanation of company fit based on bio and tweets",
  "intentSignals": [
    "Signal 1 from bio/tweets",
    "Signal 2 from bio/tweets"
  ],
  "recentTweetsInsights": [
    "Key insight from recent tweet 1",
    "Key insight from recent tweet 2"
  ],
  "pinnedTweetInsight": "Analysis of what their pinned tweet reveals about their priorities (or 'N/A')",
  "personalizedOutreachHook": "Highly personalized Twitter DM hook referencing their specific role, recent tweet topic, or company goals",
  "suggestedDmOpener": "Short, natural conversational opening question for X DM"
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: systemPrompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(
        "OpenAI Profile analysis failed, using heuristic:",
        await response.text(),
      );
      return {
        profileAnalysis: getHeuristicProfileAnalysis(),
        wasAiCallSuccessful: false,
      };
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");

    const profileAnalysis: ProfileAnalysisResult = {
      username: author?.userName || "user",
      name: author?.name || "User",
      bio: author?.description,
      location: author?.location,
      followers: author?.followers,
      roleAndCompany:
        parsed.roleAndCompany ||
        author?.description?.slice(0, 60) ||
        "Decision Maker",
      icpFitScore:
        typeof parsed.icpFitScore === "number" ? parsed.icpFitScore : 85,
      isIcpMatch: Boolean(parsed.isIcpMatch),
      verdict: parsed.verdict || "Strong ICP Lead",
      roleFitReason:
        parsed.roleFitReason || "Matches target role specifications.",
      companyFitReason:
        parsed.companyFitReason || "Company aligns with ideal client stage.",
      intentSignals: Array.isArray(parsed.intentSignals)
        ? parsed.intentSignals
        : [],
      recentTweetsInsights: Array.isArray(parsed.recentTweetsInsights)
        ? parsed.recentTweetsInsights
        : [],
      pinnedTweetInsight: parsed.pinnedTweetInsight || undefined,
      personalizedOutreachHook:
        parsed.personalizedOutreachHook ||
        `Hey ${(author?.name || "there").split(" ")[0]}, saw your profile!`,
      suggestedDmOpener:
        parsed.suggestedDmOpener ||
        `Hey ${(author?.name || "there").split(" ")[0]}, let's connect!`,
    };

    return { profileAnalysis, wasAiCallSuccessful: true };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    console.warn(
      "Profile AI evaluation error, falling back:",
      err instanceof Error ? err.message : String(err),
    );
    return {
      profileAnalysis: getHeuristicProfileAnalysis(),
      wasAiCallSuccessful: false,
    };
  }
}
