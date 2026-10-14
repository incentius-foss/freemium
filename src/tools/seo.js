// Search metadata shared by the router (runtime) and scripts/seo.js (build time).
export const SITE_URL = 'https://freemium.incentius.com'
export const SITE_NAME = 'Freemium'
export const HOME_TITLE = 'Freemium — Free Online Developer Tools (JSON, JWT, Base64, Regex…)'
export const HOME_DESCRIPTION = '41 free developer tools: JSON formatter, JWT debugger, Base64, regex tester, diff checker, hash generator, UUID, cron parser and more. Private: everything runs in your browser.'

// Titles phrased the way people search; kept under ~60 characters.
const titles = {
  'json-formatter': 'JSON Formatter & Validator Online',
  'html-beautify': 'HTML Beautifier & Minifier Online',
  'css-beautify': 'CSS Beautifier & Minifier (SCSS, LESS)',
  'js-beautify': 'JavaScript Beautifier & Minifier Online',
  'xml-beautify': 'XML Formatter & Minifier Online',
  'sql-formatter': 'SQL Formatter & Beautifier Online',
  'line-sort': 'Sort Lines & Remove Duplicates Online',
  'yaml-to-json': 'YAML to JSON Converter Online',
  'json-to-yaml': 'JSON to YAML Converter Online',
  'json-to-csv': 'JSON to CSV Converter Online',
  'csv-to-json': 'CSV to JSON Converter Online',
  'excel-to-json': 'Excel (XLSX) to JSON Converter Online',
  'number-base': 'Number Base Converter: Binary, Hex, Decimal',
  'text-case': 'Case Converter: camelCase, snake_case & More',
  'html-to-jsx': 'HTML to JSX Converter for React',
  'php-json': 'PHP Array ↔ JSON, Serialize & Unserialize',
  'svg-to-css': 'SVG to CSS Data URI Converter',
  'curl-to-code': 'cURL to Code: fetch, Axios, Python, Go',
  'json-to-code': 'JSON to TypeScript, Swift, Go & Kotlin Types',
  'hex-ascii': 'Hex to ASCII & ASCII to Hex Converter',
  'unix-time': 'Unix Timestamp Converter (Epoch to Date)',
  'jwt-debugger': 'JWT Decoder & Debugger Online',
  'regex-tester': 'Regex Tester Online (JavaScript RegExp)',
  'html-preview': 'HTML Preview Online (Sandboxed)',
  'text-diff': 'Text Diff Checker: Compare Two Texts',
  'string-inspector': 'Character & Word Counter, String Inspector',
  'markdown-preview': 'Markdown Preview & Editor Online',
  'cron-parser': 'Cron Expression Parser & Explainer',
  'color-converter': 'Color Converter: HEX, RGB, HSL, OKLCH',
  'url-parser': 'URL Parser & Query String Editor',
  'uuid': 'UUID Generator (v4, v7) & ULID Generator',
  'lorem-ipsum': 'Lorem Ipsum Generator',
  'qr-code': 'QR Code Generator & Reader Online',
  'hash-generator': 'Hash Generator: MD5, SHA-256, SHA-3, HMAC',
  'random-string': 'Random String & Password Generator',
  'base64': 'Base64 Encode & Decode Online',
  'image-base64': 'Image to Base64 Converter (Data URI)',
  'url-encode': 'URL Encode & Decode Online',
  'html-entity': 'HTML Entity Encoder & Decoder',
  'backslash-escape': 'String Escape & Unescape Tool',
  'certificate-decoder': 'SSL Certificate Decoder (X.509 PEM)',
}

export function toolMeta (tool) {
  const base = titles[tool.id] || tool.title
  return {
    title: `${base} | ${SITE_NAME}`,
    description: `${tool.subtitle} Free and private: runs entirely in your browser, nothing is uploaded.`,
  }
}

function setMeta (selector, attr, value) {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

// Keep title, description, canonical and social tags in sync with the current route.
export function applyMeta (tool) {
  if (typeof document === 'undefined') return
  const { title, description } = tool ? toolMeta(tool) : { title: HOME_TITLE, description: HOME_DESCRIPTION }
  const url = SITE_URL + (tool ? tool.path : '/')
  document.title = title
  setMeta('meta[name="description"]', 'content', description)
  setMeta('link[rel="canonical"]', 'href', url)
  setMeta('meta[property="og:url"]', 'content', url)
  setMeta('meta[property="og:title"]', 'content', title)
  setMeta('meta[property="og:description"]', 'content', description)
  setMeta('meta[name="twitter:title"]', 'content', title)
  setMeta('meta[name="twitter:description"]', 'content', description)
}
