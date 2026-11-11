const fs = require("node:fs/promises");
const path = require("node:path");

const DEFAULT_SITE_URL = "https://www.mirconsulting.publicvm.com";
const SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";
const STYLESHEET_INSTRUCTION =
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';
const CONTENT_SITEMAPS = [
    { file: "sitemap-posts.xml", endpoint: "/posts", route: "/blog" },
    {
        file: "sitemap-case-studies.xml",
        endpoint: "/case-studies",
        route: "/case-studies",
    },
    { file: "sitemap-videos.xml", endpoint: "/videos", route: "/our-work/video" },
    { file: "sitemap-team.xml", endpoint: "/team", route: "/team" },
];

function getSiteUrl() {
    const configured = process.env.REACT_APP_SITE_URL || DEFAULT_SITE_URL;
    const parsed = new URL(configured);
    if (
        !["http:", "https:"].includes(parsed.protocol) ||
        parsed.pathname !== "/" ||
        parsed.search ||
        parsed.hash
    ) {
        throw new Error("REACT_APP_SITE_URL must be an origin without a path, query, or fragment.");
    }
    return parsed.origin;
}

function getApiUrl() {
    const configured = process.env.REACT_APP_BACKEND_URL;
    if (!configured) {
        throw new Error("REACT_APP_BACKEND_URL is required to generate content sitemaps.");
    }
    const parsed = new URL(configured);
    if (
        !["http:", "https:"].includes(parsed.protocol) ||
        parsed.pathname !== "/" ||
        parsed.search ||
        parsed.hash
    ) {
        throw new Error("REACT_APP_BACKEND_URL must be an origin without a path, query, or fragment.");
    }
    return parsed.origin;
}

function escapeXml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

function renderUrlSet(urls) {
    const entries = urls
        .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`)
        .join("\n");
    const body = entries ? `${entries}\n` : "";
    return `<?xml version="1.0" encoding="UTF-8"?>\n${STYLESHEET_INSTRUCTION}\n<urlset xmlns="${SITEMAP_NAMESPACE}">\n${body}</urlset>\n`;
}

async function fetchPublicCollection(apiUrl, endpoint) {
    const url = `${apiUrl}/api${endpoint}`;
    let response;
    try {
        response = await fetch(url, {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(20000),
        });
    } catch (error) {
        throw new Error(`Could not fetch ${url}: ${error.message}`);
    }

    if (!response.ok) {
        throw new Error(`Could not fetch ${url}: HTTP ${response.status}`);
    }

    let records;
    try {
        records = await response.json();
    } catch (error) {
        throw new Error(`Invalid JSON from ${url}: ${error.message}`);
    }
    if (!Array.isArray(records)) {
        throw new Error(`Expected an array response from ${url}.`);
    }
    if (records.length === 200) {
        console.warn(
            `${url} returned 200 items; the current public endpoint limit may omit additional URLs.`
        );
    }

    return records;
}

async function waitForBackend(apiUrl) {
    const url = `${apiUrl}/api/health`;
    let response;
    try {
        response = await fetch(url, {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(60000),
        });
    } catch (error) {
        throw new Error(`Backend did not become ready at ${url}: ${error.message}`);
    }
    if (!response.ok) {
        throw new Error(`Backend health check failed at ${url}: HTTP ${response.status}`);
    }
}

function getContentUrls(records, route, sitemapName, siteUrl) {
    return records.flatMap((record) => {
        const slug =
            record && typeof record.slug === "string" ? record.slug.trim() : "";
        if (!slug || slug.includes("/")) {
            console.warn(`${sitemapName}: skipped an item without a valid URL slug.`);
            return [];
        }
        return [`${siteUrl}${route}/${encodeURIComponent(slug)}`];
    });
}

async function generateSitemaps() {
    const siteUrl = getSiteUrl();
    const apiUrl = getApiUrl();
    const outputDir = path.resolve(__dirname, "..", "build");
    const sitemapPath = path.join(outputDir, "sitemap.xml");

    const staticSitemap = await fs.readFile(sitemapPath, "utf8");
    if (!staticSitemap.includes(`<urlset xmlns="${SITEMAP_NAMESPACE}">`)) {
        throw new Error("frontend/public/sitemap.xml must contain a sitemap URL set.");
    }
    const staticUrls = [...staticSitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
        ([, url]) => url.trim()
    );
    if (staticUrls.length === 0) {
        throw new Error("frontend/public/sitemap.xml must contain at least one <loc> URL.");
    }
    if (staticUrls.some((url) => !url.startsWith(`${siteUrl}/`))) {
        throw new Error("Static sitemap URLs must use the configured REACT_APP_SITE_URL.");
    }

    await waitForBackend(apiUrl);

    const collections = await Promise.all(
        CONTENT_SITEMAPS.map(async (sitemap) => ({
            ...sitemap,
            records: await fetchPublicCollection(apiUrl, sitemap.endpoint),
        }))
    );

    const allUrls = [...staticUrls];
    for (const sitemap of collections) {
        const urls = getContentUrls(
            sitemap.records,
            sitemap.route,
            sitemap.file,
            siteUrl
        );
        if (urls.length === 0) {
            console.log(`No public URLs from ${sitemap.endpoint}.`);
            continue;
        }
        allUrls.push(...urls);
        console.log(`Added ${urls.length} URLs from ${sitemap.endpoint}.`);
    }

    await fs.writeFile(
        sitemapPath,
        renderUrlSet([...new Set(allUrls)]),
        "utf8"
    );
    console.log(`Generated sitemap.xml with ${new Set(allUrls).size} URLs.`);
}

if (require.main === module) {
    generateSitemaps().catch((error) => {
        console.error(`Sitemap generation failed: ${error.message}`);
        process.exitCode = 1;
    });
}

module.exports = {
    escapeXml,
    generateSitemaps,
    renderUrlSet,
};
