<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="sm">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>MIR Consulting XML Sitemap</title>
        <style>
          :root { color-scheme: light; }
          body { background: #fff; color: #202124; font: 16px Arial, sans-serif; margin: 0; padding: 48px 24px; }
          main { margin: 0 auto; max-width: 1040px; }
          h1 { font-size: 30px; font-weight: 600; margin: 0 0 12px; }
          p { color: #5f6368; line-height: 1.5; margin: 0 0 8px; }
          table { border-collapse: collapse; margin-top: 24px; width: 100%; }
          th, td { border: 1px solid #dadce0; padding: 14px 16px; text-align: left; overflow-wrap: anywhere; }
          th { background: #f8f9fa; color: #3c4043; font-size: 14px; font-weight: 600; }
          tbody tr:hover { background: #f8faff; }
          a { color: #1a73e8; text-decoration: underline; text-underline-offset: 2px; }
          a:hover { color: #174ea6; }
          a:focus-visible { border-radius: 2px; outline: 2px solid #1a73e8; outline-offset: 3px; }
          @media (max-width: 600px) {
            body { padding: 28px 16px; }
            h1 { font-size: 24px; }
            th, td { padding: 11px 10px; }
          }
        </style>
      </head>
      <body>
        <main>
          <h1>MIR Consulting XML Sitemap</h1>
          <xsl:choose>
            <xsl:when test="sm:sitemapindex">
              <p>This sitemap index links to the sitemap files for the public website.</p>
              <p>Number of sitemaps: <xsl:value-of select="count(sm:sitemapindex/sm:sitemap)"/>.</p>
              <table>
                <thead><tr><th scope="col">Sitemap URL</th></tr></thead>
                <tbody>
                  <xsl:for-each select="sm:sitemapindex/sm:sitemap">
                    <tr>
                      <td>
                        <a>
                          <xsl:attribute name="href"><xsl:value-of select="sm:loc"/></xsl:attribute>
                          <xsl:value-of select="sm:loc"/>
                        </a>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:when>
            <xsl:when test="sm:urlset">
              <p>This sitemap lists the public pages on the MIR Consulting website.</p>
              <p>Number of URLs: <xsl:value-of select="count(sm:urlset/sm:url)"/>.</p>
              <table>
                <thead><tr><th scope="col">Page URL</th></tr></thead>
                <tbody>
                  <xsl:for-each select="sm:urlset/sm:url">
                    <tr>
                      <td>
                        <a>
                          <xsl:attribute name="href"><xsl:value-of select="sm:loc"/></xsl:attribute>
                          <xsl:value-of select="sm:loc"/>
                        </a>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:when>
            <xsl:otherwise>
              <p>This document is not a sitemap index or URL sitemap.</p>
            </xsl:otherwise>
          </xsl:choose>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
