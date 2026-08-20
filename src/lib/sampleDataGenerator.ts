export interface IcpInput {
  mode: 'freeform' | 'structured';
  freeformText: string;
  companyName: string;
  offering: string;
  targetRole: string;
  industry: string;
  companySize: string;
  painPoints: string;
  location: string;
}

export interface TwitterLead {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  avatarBg: string;
  bio: string;
  followers: string;
  location: string;
  verified: boolean;
  matchScore: number;
  whyGoodReason: string[];
  buyingSignal: {
    type: 'Tweet' | 'Hiring' | 'Bio Update' | 'Question';
    content: string;
    timestamp: string;
    engagement: { likes: number; retweets: number; replies: number };
  };
  outreachHook: string;
  tags: string[];
}

export interface RedditLead {
  id: string;
  username: string;
  karma: string;
  accountAge: string;
  subreddit: string;
  postTitle: string;
  postSnippet: string;
  postUrl: string;
  matchScore: number;
  whyGoodReason: string[];
  buyingSignal: {
    type: 'Problem Post' | 'Vendor Request' | 'Frustration' | 'Comparison';
    content: string;
    timestamp: string;
    upvotes: number;
    commentsCount: number;
  };
  outreachHook: string;
  tags: string[];
}

// Preset samples for fast demoing
export const ICP_PRESETS = [
  {
    title: "B2B SaaS DevTools",
    freeform: "B2B SaaS founders and VP of Engineering building developer tools with 10-50 employees looking to automate lead generation and reduce developer churn.",
    structured: {
      companyName: "DevPulse AI",
      offering: "Automated developer onboarding and churn prevention analytics",
      targetRole: "Founder, VP of Engineering, Head of Product",
      industry: "B2B Developer Tools / SaaS",
      companySize: "10-50 employees ($1M-$5M ARR)",
      painPoints: "High trial dropoff, developer churn, slow enterprise adoption",
      location: "US / Europe Remote"
    }
  },
  {
    title: "Agency & Outbound Sales",
    freeform: "Founders of B2B marketing agencies and sales directors looking for high-intent LinkedIn and Twitter lead discovery tools to scale client outreach.",
    structured: {
      companyName: "LeadScale Ops",
      offering: "AI Social Listening & Outbound Lead Finder",
      targetRole: "Agency Founder, Head of Growth, Sales Director",
      industry: "Marketing & Sales Agencies",
      companySize: "5-25 team members",
      painPoints: "Manual prospect scraping, low response rates on cold email",
      location: "Worldwide"
    }
  },
  {
    title: "E-Commerce DTC Brands",
    freeform: "DTC Brand Founders and Ecommerce CMOs doing over $50k/mo revenue looking for influencer marketing and UGC creator management tools.",
    structured: {
      companyName: "PulseCreator",
      offering: "Turnkey UGC & Micro-Influencer Campaign Platform",
      targetRole: "CMO, Founder, E-commerce Manager",
      industry: "DTC E-Commerce & Retail",
      companySize: "10-100 employees",
      painPoints: "High Meta ad costs, managing influencer DMs, content fatigue",
      location: "US & Canada"
    }
  }
];

export function generateTwitterLeads(icp: IcpInput): TwitterLead[] {
  const role = icp.targetRole || (icp.freeformText.toLowerCase().includes("founder") ? "Founder" : "VP Growth");
  const industry = icp.industry || "B2B SaaS";
  const offering = icp.offering || "AI Lead Gen Solution";

  return [
    {
      id: "tw-1",
      name: "Alex Rivera",
      handle: "arivera_builds",
      avatarUrl: "",
      avatarBg: "from-blue-600 to-indigo-600",
      bio: `Co-founder @ SaaSify. Building modern developer tooling. ex-Stripe engineer. Tweeting about #buildinpublic & scaling $0 to $1M ARR.`,
      followers: "14.2K",
      location: "San Francisco, CA",
      verified: true,
      matchScore: 97,
      whyGoodReason: [
        `Direct decision maker (${role}) at an active ${industry} company matching target size.`,
        `Explicitly posted about struggling with ${icp.painPoints || "outreach conversion & customer acquisition"}.`,
        `High engagement profile with 14k+ targeted followers in your niche.`
      ],
      buyingSignal: {
        type: "Tweet",
        content: `"Honestly tired of generic cold DMs. If anyone has a smart tool for finding actual warm intent leads for ${offering ? offering.slice(0, 30) : "B2B SaaS"}, ping me."`,
        timestamp: "2 hours ago",
        engagement: { likes: 38, retweets: 7, replies: 19 }
      },
      outreachHook: `Hey Alex! Saw your tweet about finding warm intent leads. We actually built ${offering || "a intent-based discovery tool"} specifically for founders like you to spot active buying signals without spamming. Mind if I drop a 30sec preview link?`,
      tags: ["High Intent", "Founder", "Hiring"]
    },
    {
      id: "tw-2",
      name: "Elena Rostova",
      handle: "elena_growth",
      avatarUrl: "",
      avatarBg: "from-cyan-500 to-blue-500",
      bio: `Head of Growth @ HyperScale | Scaling B2B tech products | Obsessed with outbound automation & product analytics.`,
      followers: "8.9K",
      location: "Austin, TX",
      verified: false,
      matchScore: 94,
      whyGoodReason: [
        `Leads growth strategy and budget approval for tech teams.`,
        `Active in discussions around solving ${icp.painPoints || "pipeline velocity"}.`,
        `Recently expanded team and actively testing new software vendors.`
      ],
      buyingSignal: {
        type: "Hiring",
        content: `"We're hiring 2 Senior SDRs and testing automated social listening stacks for Q3 growth targets!"`,
        timestamp: "5 hours ago",
        engagement: { likes: 64, retweets: 12, replies: 28 }
      },
      outreachHook: `Hi Elena! Noticed HyperScale is expanding SDR headcount. Before you lock in your Q3 stack, would love to show how ${offering || "our solution"} boosts outbound efficiency by 4x. Open to a quick look?`,
      tags: ["Buying Signal", "Growth Lead", "Hiring"]
    },
    {
      id: "tw-3",
      name: "Marcus Vance",
      handle: "marcus_vance",
      avatarUrl: "",
      avatarBg: "from-sky-500 to-teal-500",
      bio: `Founder @ CloudFlow. Raised $3M Seed. Obsessed with high-converting funnels, developer experience & enterprise tech.`,
      followers: "22.5K",
      location: "New York, NY",
      verified: true,
      matchScore: 91,
      whyGoodReason: [
        `Seed-funded founder with budget authority looking for rapid scale.`,
        `Fits exact criteria for ${icp.companySize || "10-50 team members"}.`,
        `Frequently engages with content related to ${icp.offering || "SaaS automation"}.`
      ],
      buyingSignal: {
        type: "Question",
        content: `"What's the best tool or framework right now for solving ${icp.painPoints || "prospect discovery"} without spending 20 hours a week on manual research?"`,
        timestamp: "1 day ago",
        engagement: { likes: 89, retweets: 14, replies: 42 }
      },
      outreachHook: `Hey Marcus! Saw your question on prospect discovery tools. We built ${offering || "an automated discovery system"} that cuts research time down to minutes. Would love to share how it works for CloudFlow!`,
      tags: ["Problem Signal", "Seed Funded", "Decision Maker"]
    },
    {
      id: "tw-4",
      name: "Sophia Chen",
      handle: "sophiac_tech",
      avatarUrl: "",
      avatarBg: "from-purple-600 to-blue-600",
      bio: `VP Product @ StackPulse. Building the future of enterprise dev ecosystems. Speaker & Tech Advisor.`,
      followers: "19.1K",
      location: "Seattle, WA",
      verified: true,
      matchScore: 88,
      whyGoodReason: [
        `Executive leadership role in target sector (${industry}).`,
        `Looking to overhaul internal tools and workflow pipelines.`,
        `High credibility profile with strong network reach.`
      ],
      buyingSignal: {
        type: "Bio Update",
        content: `Updated bio & recently posted: "Evaluating new vendor tools for our sales & product workflow streamlining."`,
        timestamp: "2 days ago",
        engagement: { likes: 45, retweets: 5, replies: 11 }
      },
      outreachHook: `Hi Sophia! Saw your recent post about evaluating new workflow tools. Given your work at StackPulse, ${offering || "our platform"} could fit seamlessly into your existing tech stack. Worth a brief chat?`,
      tags: ["VP Level", "Enterprise Fit"]
    }
  ];
}

export function generateRedditLeads(icp: IcpInput): RedditLead[] {
  const industry = icp.industry || "B2B SaaS";
  const offering = icp.offering || "Outreach & ICP discovery tool";
  const pain = icp.painPoints || "low cold outreach conversion rates and high manual research time";

  return [
    {
      id: "red-1",
      username: "u/SaaS_Founder_2026",
      karma: "18.4k",
      accountAge: "4 years",
      subreddit: "r/SaaS",
      postTitle: `What is your current stack for solving ${pain.slice(0, 45)}?`,
      postSnippet: `Hey r/SaaS, we run a ${industry} startup ($25k MRR). Currently our team is spending way too much time manually searching Twitter and Reddit for prospects. We tried traditional databases like Apollo, but the data is stale. Looking for recommendations for tools that catch active intent signals on social platforms...`,
      postUrl: "https://reddit.com/r/SaaS/comments/sample1",
      matchScore: 98,
      whyGoodReason: [
        `Author is a verified SaaS Founder ($25k MRR) with active purchasing intent.`,
        `Explicitly asking for vendor recommendations in ${industry}.`,
        `High urgency problem matching your exact core offering (${offering}).`
      ],
      buyingSignal: {
        type: "Vendor Request",
        content: `"Looking for tool recommendations that catch active intent signals... drop your suggestions below."`,
        timestamp: "3 hours ago",
        upvotes: 47,
        commentsCount: 32
      },
      outreachHook: `Hey! Saw your thread in r/SaaS regarding finding active intent signals on Twitter/Reddit. We actually built ${offering} to address this exact bottleneck. It scans live posts/bios for buying signals so you don't waste time on stale databases. Happy to DM you a trial account if you're interested!`,
      tags: ["High Urgency", "Vendor Request", "r/SaaS"]
    },
    {
      id: "red-2",
      username: "u/Growth_Ninja_Dev",
      karma: "9.2k",
      accountAge: "2 years",
      subreddit: "r/startups",
      postTitle: `Frustrated with standard outbound methods. What's actually working in 2026?`,
      postSnippet: `Cold email response rates have dropped to under 1% for us. We're looking to pivot to high-intent social monitoring (listening to people complaining about competitors on X and Reddit). Anyone doing this successfully at scale?`,
      postUrl: "https://reddit.com/r/startups/comments/sample2",
      matchScore: 95,
      whyGoodReason: [
        `Directly describing the exact pain point your product addresses.`,
        `Actively seeking a social listening and signal-based discovery system.`,
        `Decision maker at a growing startup.`
      ],
      buyingSignal: {
        type: "Problem Post",
        content: `"Cold email response rates dropped under 1%... looking to pivot to high-intent social monitoring."`,
        timestamp: "6 hours ago",
        upvotes: 89,
        commentsCount: 54
      },
      outreachHook: `Spot on with the shift toward intent listening! We've been using real-time keyword + bio filtering for ${offering} and seeing 4-5x higher reply rates compared to generic outbound. Here's a quick breakdown of how we structure it if you want to test it out: [Link]`,
      tags: ["Problem Post", "r/startups", "High Match"]
    },
    {
      id: "red-3",
      username: "u/TechProductLead",
      karma: "31.1k",
      accountAge: "6 years",
      subreddit: "r/webdev",
      postTitle: `Evaluating tools to streamline developer outreach & customer engagement`,
      postSnippet: `Our product team needs a better way to monitor community feedback and reach out to engineers asking for solution alternatives. Any tools that combine social scanning with automated personalized hooks?`,
      postUrl: "https://reddit.com/r/webdev/comments/sample3",
      matchScore: 92,
      whyGoodReason: [
        `Product Lead in technical domain with tool evaluation budget.`,
        `Needs automated outreach hook generation and monitoring.`,
        `Established Reddit account with high community influence.`
      ],
      buyingSignal: {
        type: "Comparison",
        content: `"Any tools that combine social scanning with automated personalized hooks?"`,
        timestamp: "1 day ago",
        upvotes: 34,
        commentsCount: 18
      },
      outreachHook: `Hey u/TechProductLead! We built ${offering} precisely for this. It extracts pain point signals from Reddit/Twitter and crafts customized personalized hooks for each prospect. Would love to send you a 2-min demo!`,
      tags: ["Comparison", "r/webdev", "Evaluator"]
    },
    {
      id: "red-4",
      username: "u/AgencyScale2026",
      karma: "5.7k",
      accountAge: "1 year",
      subreddit: "r/sales",
      postTitle: `How we booked 30+ discovery calls last month using social signal monitoring`,
      postSnippet: `Instead of scraping cold lists, we started targeting users who posted specific questions on Reddit and Twitter within the last 24 hours. The conversion rate was night and day.`,
      postUrl: "https://reddit.com/r/sales/comments/sample4",
      matchScore: 89,
      whyGoodReason: [
        `Agency owner who understands value of signal-based sales.`,
        `Fits target ICP profile for agencies scaling client workflows.`,
        `High engagement in sales community.`
      ],
      buyingSignal: {
        type: "Frustration",
        content: `"Scraping cold lists is dead. Real-time signal monitoring is the only way."`,
        timestamp: "2 days ago",
        upvotes: 112,
        commentsCount: 68
      },
      outreachHook: `Great insights on real-time signal monitoring! If you're looking to automate that workflow across your agency clients, ${offering} automates the parsing & hook creation so your team saves 15+ hours/week.`,
      tags: ["Agency Owner", "r/sales"]
    }
  ];
}
