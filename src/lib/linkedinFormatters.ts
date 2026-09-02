/**
 * Formats large numbers compactly, e.g. 1500 -> "1.5K", 2300000 -> "2.3M"
 */
export function formatCompactNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return "0";
  if (num < 1000) return num.toString();
  if (num < 1000000) {
    const formatted = (num / 1000).toFixed(1);
    return formatted.endsWith(".0") ? `${parseInt(formatted)}K` : `${formatted}K`;
  }
  const formatted = (num / 1000000).toFixed(1);
  return formatted.endsWith(".0") ? `${parseInt(formatted)}M` : `${formatted}M`;
}

/**
 * Formats relative date or ISO timestamp to readable string
 */
export function formatRelativeDate(
  isoDate?: string | null,
  fallbackDate?: string | null
): string {
  if (fallbackDate && fallbackDate.length < 10 && !fallbackDate.includes("-")) {
    return fallbackDate;
  }

  const dateToParse = isoDate || fallbackDate;
  if (!dateToParse) return "Recently";

  try {
    const date = new Date(dateToParse);
    if (isNaN(date.getTime())) return fallbackDate || "Recently";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return fallbackDate || "Recently";
  }
}

/**
 * Formats full datetime for tooltip or inspector
 */
export function formatFullDateTime(isoDate?: string | null): string {
  if (!isoDate) return "Unknown date";
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return isoDate;
  }
}
