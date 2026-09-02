import { NextResponse } from "next/server";
import {
  searchLinkedin,
  generateFallbackLinkedinPosts,
  getUnipileConfig,
} from "@/lib/linkedinApi";
import {
  LinkedinPostItem,
  LinkedinSearchOptions,
  LinkedinSearchPaging,
} from "@/lib/linkedinTypes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get("keywords")?.trim() || "";
    const category =
      (searchParams.get("category") as
        | "posts"
        | "people"
        | "companies"
        | "jobs") || "posts";
    const sortBy = searchParams.get("sortBy") as
      | "relevance"
      | "date"
      | undefined;
    const datePosted = searchParams.get("datePosted") as
      | "past_day"
      | "past_week"
      | "past_month"
      | undefined;
    const contentType = searchParams.get("contentType") as
      | "videos"
      | "images"
      | "live_videos"
      | "collaborative_articles"
      | "documents"
      | "jobs"
      | undefined;
    const cursor = searchParams.get("cursor")?.trim() || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 10;
    const forceFallback = searchParams.get("fallback") === "true";

    let apiErrorMessage: string | null = null;
    let accountId = "";

    try {
      const config = getUnipileConfig();
      accountId = config.accountId;
    } catch (cfgErr: unknown) {
      apiErrorMessage =
        cfgErr instanceof Error ? cfgErr.message : String(cfgErr);
    }

    // If keywords is empty, return empty result without calling API
    if (!keywords) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          total: 0,
          has_next_page: false,
          next_cursor: null,
          source: "api",
          query: "",
          category,
          sortBy,
          datePosted,
          contentType,
          apiStatus: {
            isLive: true,
            errorMessage: apiErrorMessage,
            accountId,
          },
        },
      });
    }

    let rawData: Record<string, unknown> | null = null;
    let source: "api" | "fallback" = "api";

    if (!forceFallback && !apiErrorMessage) {
      try {
        const searchOpts: LinkedinSearchOptions = {
          api: "classic",
          category,
          keywords,
          sort_by: sortBy || "relevance",
          date_posted: datePosted,
          content_type: contentType,
          limit,
          cursor,
        };

        rawData = (await searchLinkedin(searchOpts)) as Record<string, unknown>;
      } catch (apiErr: unknown) {
        apiErrorMessage =
          apiErr instanceof Error ? apiErr.message : String(apiErr);
        console.warn(
          "Live Unipile LinkedIn Post Search failed:",
          apiErrorMessage
        );
      }
    }

    let items: LinkedinPostItem[] = [];
    let hasNextPage = false;
    let nextCursor: string | null = null;
    let paging: LinkedinSearchPaging = {
      start: 0,
      page_count: 0,
      total_count: null,
    };

    if (rawData && Array.isArray(rawData.items)) {
      items = rawData.items as LinkedinPostItem[];
      source = "api";
      if (rawData.cursor) {
        nextCursor = String(rawData.cursor);
        hasNextPage = true;
      }
      if (rawData.paging && typeof rawData.paging === "object") {
        paging = rawData.paging as LinkedinSearchPaging;
        if (paging.page_count && paging.page_count >= limit) {
          hasNextPage = Boolean(nextCursor);
        }
      }
    } else {
      source = "fallback";
      items = generateFallbackLinkedinPosts(keywords);
    }

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: items.length,
        has_next_page: hasNextPage,
        next_cursor: nextCursor,
        source,
        query: keywords,
        category,
        sortBy,
        datePosted,
        contentType,
        paging,
        apiStatus: {
          isLive: source === "api",
          errorMessage: apiErrorMessage,
          accountId,
        },
      },
    });
  } catch (error: unknown) {
    console.error("LinkedIn search route error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to perform LinkedIn search",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const keywords = (body.keywords as string)?.trim() || "";
    const category =
      (body.category as "posts" | "people" | "companies" | "jobs") || "posts";
    const sortBy = body.sort_by as "relevance" | "date" | undefined;
    const datePosted = body.date_posted as
      | "past_day"
      | "past_week"
      | "past_month"
      | undefined;
    const contentType = body.content_type as
      | "videos"
      | "images"
      | "live_videos"
      | "collaborative_articles"
      | "documents"
      | "jobs"
      | undefined;
    const cursor = (body.cursor as string)?.trim() || undefined;
    const limit = body.limit ? Number(body.limit) : 10;
    const forceFallback = body.fallback === true;

    let apiErrorMessage: string | null = null;
    let accountId = "";

    try {
      const config = getUnipileConfig();
      accountId = config.accountId;
    } catch (cfgErr: unknown) {
      apiErrorMessage =
        cfgErr instanceof Error ? cfgErr.message : String(cfgErr);
    }

    // If keywords is empty, return empty result without calling API
    if (!keywords) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          total: 0,
          has_next_page: false,
          next_cursor: null,
          source: "api",
          query: "",
          category,
          sortBy,
          datePosted,
          contentType,
          apiStatus: {
            isLive: true,
            errorMessage: apiErrorMessage,
            accountId,
          },
        },
      });
    }

    let rawData: Record<string, unknown> | null = null;
    let source: "api" | "fallback" = "api";

    if (!forceFallback && !apiErrorMessage) {
      try {
        const searchOpts: LinkedinSearchOptions = {
          api: (body.api as "classic" | "sales_navigator") || "classic",
          category,
          keywords,
          sort_by: sortBy || "relevance",
          date_posted: datePosted,
          content_type: contentType,
          limit,
          cursor,
        };

        rawData = (await searchLinkedin(searchOpts)) as Record<string, unknown>;
      } catch (apiErr: unknown) {
        apiErrorMessage =
          apiErr instanceof Error ? apiErr.message : String(apiErr);
        console.warn(
          "Live Unipile LinkedIn Post Search failed:",
          apiErrorMessage
        );
      }
    }

    let items: LinkedinPostItem[] = [];
    let hasNextPage = false;
    let nextCursor: string | null = null;
    let paging: LinkedinSearchPaging = {
      start: 0,
      page_count: 0,
      total_count: null,
    };

    if (rawData && Array.isArray(rawData.items)) {
      items = rawData.items as LinkedinPostItem[];
      source = "api";
      if (rawData.cursor) {
        nextCursor = String(rawData.cursor);
        hasNextPage = true;
      }
      if (rawData.paging && typeof rawData.paging === "object") {
        paging = rawData.paging as LinkedinSearchPaging;
        if (paging.page_count && paging.page_count >= limit) {
          hasNextPage = Boolean(nextCursor);
        }
      }
    } else {
      source = "fallback";
      items = generateFallbackLinkedinPosts(keywords);
    }

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: items.length,
        has_next_page: hasNextPage,
        next_cursor: nextCursor,
        source,
        query: keywords,
        category,
        sortBy,
        datePosted,
        contentType,
        paging,
        apiStatus: {
          isLive: source === "api",
          errorMessage: apiErrorMessage,
          accountId,
        },
      },
    });
  } catch (error: unknown) {
    console.error("LinkedIn search route POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to perform LinkedIn search",
      },
      { status: 500 }
    );
  }
}
