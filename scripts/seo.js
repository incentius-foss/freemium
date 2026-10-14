// Post-build SEO step: writes dist/spa/<tool>/index.html with that tool's title, description,
// canonical URL, Open Graph/Twitter tags and JSON-LD baked in, so crawlers and link previews
// get the right metadata without running JavaScript. Also writes sitemap.xml and robots.txt.
import fs from 'node:fs'
import path from 'node:path'
import { tools, categoryById } from '../src/tools/registry.js'
import { SITE_URL, SITE_NAME, HOME_TITLE, HOME_DESCRIPTION, toolMeta } from '../src/tools/seo.js'

const dist = path.resolve('dist/spa')
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// The built index.html is minified (attribute quotes may be dropped), so swap whole tags.
const tag = (html, re, replacement) => {
  if (!re.test(html)) throw new Error(`seo.js: tag not found in index.html: ${re}`)
  return html.replace(re, replacement)
}
const metaRe = (key) => new RegExp(`<meta (?:name|property)="?${key.replace(/[:]/g, '\\$&')}"? [^>]*>`)

function render ({ title, description, url, jsonLd }) {
  let html = template
  html = tag(html, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  html = tag(html, metaRe('description'), `<meta name="description" content="${esc(description)}">`)
  html = tag(html, /<link rel="?canonical"? [^>]*>/, `<link rel="canonical" href="${url}">`)
  html = tag(html, metaRe('og:url'), `<meta property="og:url" content="${url}">`)
  html = tag(html, metaRe('og:title'), `<meta property="og:title" content="${esc(title)}">`)
  html = tag(html, metaRe('og:description'), `<meta property="og:description" content="${esc(description)}">`)
  html = tag(html, metaRe('twitter:title'), `<meta name="twitter:title" content="${esc(title)}">`)
  html = tag(html, metaRe('twitter:description'), `<meta name="twitter:description" content="${esc(description)}">`)
  html = tag(html, /<script type="?application\/ld\+json"?>[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`)
  return html
}

for (const tool of tools) {
  const m = toolMeta(tool)
  const url = `${SITE_URL}${tool.path}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: tool.title,
        url,
        description: m.description,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any (web browser)',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        keywords: tool.keywords.join(', '),
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL + '/' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL + '/' },
          { '@type': 'ListItem', position: 2, name: categoryById[tool.category].title, item: SITE_URL + '/' },
          { '@type': 'ListItem', position: 3, name: tool.title, item: url },
        ],
      },
    ],
  }
  const out = path.join(dist, `${tool.id}.html`) // Netlify serves /<id> from <id>.html without a slash redirect
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, render({ title: m.title, description: m.description, url, jsonLd }))
}

// Home page keeps its own copy with the site-level JSON-LD (already in index.html).
fs.writeFileSync(path.join(dist, 'index.html'), render({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  url: SITE_URL + '/',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL + '/',
    description: HOME_DESCRIPTION,
    potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
  },
}))

const today = new Date().toISOString().slice(0, 10)
const urls = ['/', ...tools.map((t) => t.path)]
fs.writeFileSync(path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) =>
    `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}\n</urlset>\n`)
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)

console.log(` SEO • wrote ${tools.length} tool pages, sitemap.xml (${urls.length} URLs) and robots.txt`)
