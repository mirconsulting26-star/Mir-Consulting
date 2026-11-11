const fs = require("node:fs/promises");
const path = require("node:path");

const DEFAULT_SITE_URL = "https://www.mirconsulting.publicvm.com";
const SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";
const STYLESHEET_INSTRUCTION =
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';
const PAGE_SITEMAP = "sitemap-pages.xml";
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

function renderSitemapIndex(sitemapFiles, siteUrl) {
    const entries = sitemapFiles
        .map(
            (file) =>
                `  <sitemap>\n    <loc>${escapeXml(`${siteUrl}/${file}`)}</loc>\n  </sitemap>`
        )
        .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n${STYLESHEET_INSTRUCTION}\n<sitemapindex xmlns="${SITEMAP_NAMESPACE}">\n${entries}\n</sitemapindex>\n`;
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

    await fs.access(path.join(outputDir, PAGE_SITEMAP));
    await waitForBackend(apiUrl);

    const collections = await Promise.all(
        CONTENT_SITEMAPS.map(async (sitemap) => ({
            ...sitemap,
            records: await fetchPublicCollection(apiUrl, sitemap.endpoint),
        }))
    );

    const sitemapFiles = [PAGE_SITEMAP];
    for (const sitemap of collections) {
        const urls = getContentUrls(
            sitemap.records,
            sitemap.route,
            sitemap.file,
            siteUrl
        );
        if (urls.length === 0) {
            console.log(`Omitted ${sitemap.file}; it has no public URLs.`);
            continue;
        }
        await fs.writeFile(
            path.join(outputDir, sitemap.file),
            renderUrlSet(urls),
            "utf8"
        );
        sitemapFiles.push(sitemap.file);
        console.log(`Generated ${sitemap.file} (${urls.length} URLs).`);
    }

    await fs.writeFile(
        path.join(outputDir, "sitemap.xml"),
        renderSitemapIndex(sitemapFiles, siteUrl),
        "utf8"
    );
    console.log(
        `Generated sitemap.xml with ${sitemapFiles.length} child sitemaps.`
    );
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
    renderSitemapIndex,
    renderUrlSet,
};
