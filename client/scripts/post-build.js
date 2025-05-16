const fs = require('fs');
const path = require('path');

// Create robots.txt
const robotsTxt = `User-agent: *
Allow: /
Sitemap: http://datartechnologies.com/sitemap.xml`;

fs.writeFileSync(path.join(__dirname, '../build/robots.txt'), robotsTxt);

// Create sitemap.xml
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://datartechnologies.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>http://datartechnologies.com/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>http://datartechnologies.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>http://datartechnologies.com/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

fs.writeFileSync(path.join(__dirname, '../build/sitemap.xml'), sitemapXml);

console.log('Post-build optimization completed!'); 