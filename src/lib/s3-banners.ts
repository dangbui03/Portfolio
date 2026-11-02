export interface BannerItem {
  id: string;
  s3Key: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  tag: string;
  href?: string;
  alt: string;
}

export interface S3BannerConfig {
  /**
   * Base URL of AWS S3 Bucket or CloudFront CDN.
   * Example: "https://my-portfolio-bucket.s3.ap-southeast-1.amazonaws.com"
   */
  bucketBaseUrl?: string;
  /**
   * Optional API endpoint that returns JSON list of BannerItem or S3 keys.
   * Example: "/api/banners" or "https://api.example.com/s3-banners"
   */
  apiEndpoint?: string;
}

const DEFAULT_CONFIG: S3BannerConfig = {
  bucketBaseUrl: process.env.NEXT_PUBLIC_S3_BUCKET_URL || "",
  apiEndpoint: process.env.NEXT_PUBLIC_BANNER_API_URL || "",
};

/**
 * Helper to generate an inline SVG data URI placeholder that matches
 * the Autumn Crossroads aesthetic before an actual S3 bucket is connected.
 */
function createAutumnPlaceholderSvg(
  bgStart: string,
  bgEnd: string,
  accent: string,
  sunColor: string,
  label: string,
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420" width="800" height="420">
    <defs>
      <linearGradient id="sky" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}" />
        <stop offset="100%" stop-color="${bgEnd}" />
      </linearGradient>
      <radialGradient id="sun" cx="72%" cy="32%" r="36%">
        <stop offset="0%" stop-color="${sunColor}" stop-opacity="0.92" />
        <stop offset="65%" stop-color="${accent}" stop-opacity="0.28" />
        <stop offset="100%" stop-color="${bgEnd}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="800" height="420" fill="url(#sky)" />
    <circle cx="576" cy="134" r="145" fill="url(#sun)" />
    <circle cx="576" cy="134" r="46" fill="${sunColor}" opacity="0.85" />
    <path d="M0 310 Q180 230 370 285 T800 250 L800 420 L0 420 Z" fill="${accent}" opacity="0.32" />
    <path d="M0 345 Q260 275 510 330 T800 300 L800 420 L0 420 Z" fill="#3a2014" opacity="0.58" />
    <path d="M0 378 Q400 340 800 372 L800 420 L0 420 Z" fill="#27140b" opacity="0.88" />
    <g opacity="0.22" stroke="#fdfbf7" stroke-width="1.5" fill="none">
      <line x1="48" y1="44" x2="160" y2="44" />
      <circle cx="48" cy="44" r="3" fill="#fdfbf7" />
    </g>
    <text x="48" y="82" fill="#fdfbf7" opacity="0.18" font-family="Georgia, serif" font-size="15" letter-spacing="3">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Local Mock Data representing items that will later come from AWS S3.
 * When `NEXT_PUBLIC_S3_BUCKET_URL` is configured, `resolveS3ImageUrl` automatically
 * maps `s3Key` to the live S3 object URL without touching any UI component.
 */
export const MOCK_S3_BANNERS: BannerItem[] = [
  {
    id: "banner-autumn-trail",
    s3Key: "banners/autumn-crossroads-01.webp",
    imageUrl: createAutumnPlaceholderSvg(
      "#4e2d1d",
      "#9a3412",
      "#d97706",
      "#fde68a",
      "S3 // AUTUMN-CROSSROADS-01",
    ),
    title: "Autumn Crossroads Architecture",
    subtitle: "Interactive 3D wooden signpost & tactile web craftsmanship",
    tag: "Featured Work",
    href: "/projects",
    alt: "Warm autumn mountain horizon with golden sun and timber silhouettes",
  },
  {
    id: "banner-shader-woods",
    s3Key: "banners/webgl-timber-lighting-02.webp",
    imageUrl: createAutumnPlaceholderSvg(
      "#2c3b2b",
      "#475543",
      "#b45309",
      "#fcd34d",
      "S3 // WEBGL-TIMBER-02",
    ),
    title: "Real-Time Three.js & Lighting",
    subtitle: "Physically based wood grain, soft shadows & pendulum physics",
    tag: "3D Graphics",
    href: "/projects",
    alt: "Mossy forest twilight landscape with warm amber glow",
  },
  {
    id: "banner-field-notes",
    s3Key: "banners/engineering-field-notes-03.webp",
    imageUrl: createAutumnPlaceholderSvg(
      "#3a2014",
      "#78350f",
      "#f59e0b",
      "#fef3c7",
      "S3 // FIELD-NOTES-03",
    ),
    title: "Campfire Engineering Essays",
    subtitle: "Deep-dive notes on distributed systems, UI physics & Next.js",
    tag: "Journal",
    href: "/blog",
    alt: "Golden amber dusk hills with parchment horizon lines",
  },
  {
    id: "banner-craft-story",
    s3Key: "banners/maker-origin-story-04.webp",
    imageUrl: createAutumnPlaceholderSvg(
      "#431407",
      "#7c2d12",
      "#ea580c",
      "#fed7aa",
      "S3 // MAKER-STORY-04",
    ),
    title: "The Maker Behind the Trail",
    subtitle: "Design philosophy, full-stack journey & open-source tools",
    tag: "About Me",
    href: "/about",
    alt: "Crimson autumn canyon sunset with warm campfire tones",
  },
  {
    id: "banner-campfire-contact",
    s3Key: "banners/campfire-dispatch-05.webp",
    imageUrl: createAutumnPlaceholderSvg(
      "#1c1917",
      "#44403c",
      "#d97706",
      "#fde047",
      "S3 // CAMPFIRE-DISPATCH-05",
    ),
    title: " Pull Up a Log by the Fire",
    subtitle: "Collaborations, consulting inquiries & fellow traveler notes",
    tag: "Connect",
    href: "/contact",
    alt: "Starlit evening ridge with warm amber lantern glow",
  },
];

/**
 * Resolves a banner's final image URL.
 * - If `bucketBaseUrl` is provided and `s3Key` exists, builds the full S3 URL.
 * - Otherwise falls back to `banner.imageUrl` (mock or pre-signed URL).
 */
export function resolveS3ImageUrl(
  banner: Pick<BannerItem, "s3Key" | "imageUrl">,
  config: S3BannerConfig = DEFAULT_CONFIG,
): string {
  const baseUrl = config.bucketBaseUrl?.trim().replace(/\/+$/, "");
  if (baseUrl && banner.s3Key) {
    const cleanKey = banner.s3Key.replace(/^\/+/, "");
    return `${baseUrl}/${cleanKey}`;
  }
  return banner.imageUrl;
}

/**
 * Fetches the list of banners from an API/S3 manifest or falls back to local mock data.
 * To connect real AWS S3 later:
 * 1. Set `NEXT_PUBLIC_S3_BUCKET_URL=https://<your-bucket>.s3.<region>.amazonaws.com`
 * 2. Or set `NEXT_PUBLIC_BANNER_API_URL=/api/s3-banners` returning `BannerItem[]`
 */
export async function fetchS3Banners(
  config: S3BannerConfig = DEFAULT_CONFIG,
  signal?: AbortSignal,
): Promise<{ items: BannerItem[]; isMock: boolean }> {
  const apiEndpoint = config.apiEndpoint?.trim();

  if (apiEndpoint) {
    const response = await fetch(apiEndpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch S3 banners (${response.status})`);
    }

    const payload = (await response.json()) as BannerItem[];
    const items = payload.map((item) => ({
      ...item,
      imageUrl: resolveS3ImageUrl(item, config),
    }));

    return { items, isMock: false };
  }

  // When only NEXT_PUBLIC_S3_BUCKET_URL is configured, map MOCK_S3_BANNERS keys to real S3 URLs
  const hasBucketUrl = Boolean(config.bucketBaseUrl?.trim());
  const items = MOCK_S3_BANNERS.map((item) => ({
    ...item,
    imageUrl: resolveS3ImageUrl(item, config),
  }));

  return { items, isMock: !hasBucketUrl };
}
