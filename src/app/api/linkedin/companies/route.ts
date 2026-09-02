import { NextResponse } from "next/server";
import {
  searchLinkedinCompanies,
  generateFallbackLinkedinCompanies,
  getUnipileConfig,
} from "@/lib/linkedinApi";
import {
  LinkedinCompanyItem,
  LinkedinCompanySearchOptions,
  LinkedinSearchPaging,
} from "@/lib/linkedinTypes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get("keywords")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const industry = searchParams.get("industry")?.trim() || "";
    const hasJobOffers = searchParams.get("hasJobOffers") === "true";
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

    // If no search criteria provided, return empty list without calling API
    if (!keywords && !location && !industry) {
      return NextResponse.json({
        success: true,
        data: {
          companies: [],
          total: 0,
          has_next_page: false,
          next_cursor: null,
          source: "api",
          keywords: "",
          location: "",
          industry: "",
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
        const searchOpts: LinkedinCompanySearchOptions = {
          api: "classic",
          keywords,
          location: location || undefined,
          industry: industry || undefined,
          has_job_offers: hasJobOffers || undefined,
          limit,
          cursor,
        };

        rawData = (await searchLinkedinCompanies(searchOpts)) as Record<
          string,
          unknown
        >;
      } catch (apiErr: unknown) {
        apiErrorMessage =
          apiErr instanceof Error ? apiErr.message : String(apiErr);
        console.warn(
          "Live Unipile LinkedIn Company Search failed:",
          apiErrorMessage
        );
      }
    }

    let companies: LinkedinCompanyItem[] = [];
    let hasNextPage = false;
    let nextCursor: string | null = null;
    let paging: LinkedinSearchPaging = {
      start: 0,
      page_count: 0,
      total_count: null,
    };

    if (rawData && Array.isArray(rawData.items)) {
      companies = rawData.items as LinkedinCompanyItem[];
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
      companies = generateFallbackLinkedinCompanies(
        keywords,
        location,
        industry
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        companies,
        total: companies.length,
        has_next_page: hasNextPage,
        next_cursor: nextCursor,
        source,
        keywords,
        location,
        industry,
        paging,
        apiStatus: {
          isLive: source === "api",
          errorMessage: apiErrorMessage,
          accountId,
        },
      },
    });
  } catch (error: unknown) {
    console.error("LinkedIn company search route error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to perform LinkedIn company search",
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
    const location = (body.location as string)?.trim() || "";
    const industry = (body.industry as string)?.trim() || "";
    const hasJobOffers = body.has_job_offers === true;
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

    // If no search criteria provided, return empty list without calling API
    if (!keywords && !location && !industry) {
      return NextResponse.json({
        success: true,
        data: {
          companies: [],
          total: 0,
          has_next_page: false,
          next_cursor: null,
          source: "api",
          keywords: "",
          location: "",
          industry: "",
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
        const searchOpts: LinkedinCompanySearchOptions = {
          api: (body.api as "classic" | "sales_navigator") || "classic",
          keywords,
          location: location || undefined,
          industry: industry || undefined,
          has_job_offers: hasJobOffers || undefined,
          limit,
          cursor,
        };

        rawData = (await searchLinkedinCompanies(searchOpts)) as Record<
          string,
          unknown
        >;
      } catch (apiErr: unknown) {
        apiErrorMessage =
          apiErr instanceof Error ? apiErr.message : String(apiErr);
        console.warn(
          "Live Unipile LinkedIn Company Search failed:",
          apiErrorMessage
        );
      }
    }

    let companies: LinkedinCompanyItem[] = [];
    let hasNextPage = false;
    let nextCursor: string | null = null;
    let paging: LinkedinSearchPaging = {
      start: 0,
      page_count: 0,
      total_count: null,
    };

    if (rawData && Array.isArray(rawData.items)) {
      companies = rawData.items as LinkedinCompanyItem[];
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
      companies = generateFallbackLinkedinCompanies(
        keywords,
        location,
        industry
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        companies,
        total: companies.length,
        has_next_page: hasNextPage,
        next_cursor: nextCursor,
        source,
        keywords,
        location,
        industry,
        paging,
        apiStatus: {
          isLive: source === "api",
          errorMessage: apiErrorMessage,
          accountId,
        },
      },
    });
  } catch (error: unknown) {
    console.error("LinkedIn company search route POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to perform LinkedIn company search",
      },
      { status: 500 }
    );
  }
}
