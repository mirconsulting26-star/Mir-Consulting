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
          body { font: 16px Arial, sans-serif; color: #333; margin: 32px auto; max-width: 1100px; padding: 0 20px; }
          h1 { font-size: 30px; margin-bottom: 12px; }
          p { color: #555; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; overflow-wrap: anywhere; }
          th { background: #f3f4f6; }
          tr:nth-child(even) { background: #f0f0f0; }
          a { color: #174ea6; }
        </style>
      </head>
      <body>
        <h1>MIR Consulting XML Sitemap</h1>
        <xsl:choose>
          <xsl:when test="sm:sitemapindex">
            <p>This sitemap index links to sitemap files for the public website.</p>
            <p>Number of sitemaps: <xsl:value-of select="count(sm:sitemapindex/sm:sitemap)"/>.</p>
            <table>
              <thead><tr><th>Sitemap URL</th></tr></thead>
              <tbody>
                <xsl:for-each select="sm:sitemapindex/sm:sitemap">
                  <tr><td><a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a></td></tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:when>
          <xsl:when test="sm:urlset">
            <p>This sitemap lists public pages on the MIR Consulting website.</p>
            <p>Number of URLs: <xsl:value-of select="count(sm:urlset/sm:url)"/>.</p>
            <table>
              <thead><tr><th>URL</th></tr></thead>
              <tbody>
                <xsl:for-each select="sm:urlset/sm:url">
                  <tr><td><a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a></td></tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:when>
          <xsl:otherwise>
            <p>This document is not a sitemap index or URL sitemap.</p>
          </xsl:otherwise>
        </xsl:choose>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
