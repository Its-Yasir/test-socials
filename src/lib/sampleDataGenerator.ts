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

