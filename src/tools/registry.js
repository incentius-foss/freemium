// Single source of truth for every tool: navigation, routes, search, and Smart Paste.
//
// detect(text) → 0..1 confidence that `text` belongs to the tool. Smart Paste on the
// home page ranks tools by it (the DevUtils "smart detection" idea, done client-side).

export const categories = [
  { id: 'format', title: 'Format & Minify', color: 'blue' },
  { id: 'convert', title: 'Convert', color: 'green' },
  { id: 'inspect', title: 'Inspect & Debug', color: 'orange' },
  { id: 'generate', title: 'Generate', color: 'purple' },
  { id: 'encode', title: 'Encode & Decode', color: 'pink' },
]

const isJson = (s) => {
  const t = s.trim()
  if (!/^[[{]/.test(t)) return false
  try { JSON.parse(t); return true } catch { return false }
}
const lines = (s) => s.trim().split(/\r?\n/)

export const tools = [
  // ── Format & Minify ──────────────────────────────────────────────
  {
    id: 'json-formatter', title: 'JSON Formatter', subtitle: 'Format, validate, sort and minify JSON.',
    category: 'format', icon: 'braces', keywords: ['json', 'pretty', 'validate', 'minify', 'lint'],
    component: () => import('@/pages/tools/JsonFormatter.vue'),
    detect: (s) => (isJson(s) ? 0.9 : 0),
  },
  {
    id: 'html-beautify', title: 'HTML Beautify', subtitle: 'Beautify or minify HTML and ERB templates.',
    category: 'format', icon: 'code', keywords: ['html', 'erb', 'markup', 'pretty', 'minify'],
    component: () => import('@/pages/tools/HtmlBeautify.vue'),
    detect: (s) => (/^\s*(<!doctype html|<html|<(div|body|head|section|span|p|ul|table)\b)/i.test(s) ? 0.65 : 0),
  },
  {
    id: 'css-beautify', title: 'CSS Beautify', subtitle: 'Beautify or minify CSS, SCSS and LESS.',
    category: 'format', icon: 'palette', keywords: ['css', 'scss', 'less', 'sass', 'style', 'minify'],
    component: () => import('@/pages/tools/CssBeautify.vue'),
    detect: (s) => (/^[\s\S]*[.#@:\w-][^{]*\{[^}]*:[^}]*;?\s*\}/.test(s.trim()) && !isJson(s) && !/function|=>/.test(s) ? 0.5 : 0),
  },
  {
    id: 'js-beautify', title: 'JavaScript Beautify', subtitle: 'Beautify or minify JavaScript.',
    category: 'format', icon: 'textAlign', keywords: ['js', 'javascript', 'typescript', 'pretty', 'minify'],
    component: () => import('@/pages/tools/JsBeautify.vue'),
    detect: (s) => (/\b(function|const|let|var|=>|import|export)\b/.test(s) && /[;{}]/.test(s) ? 0.45 : 0),
  },
  {
    id: 'xml-beautify', title: 'XML Beautify', subtitle: 'Beautify or minify XML documents.',
    category: 'format', icon: 'code', keywords: ['xml', 'svg', 'plist', 'rss', 'pretty', 'minify'],
    component: () => import('@/pages/tools/XmlBeautify.vue'),
    detect: (s) => (/^\s*<\?xml/.test(s) ? 0.95 : /^\s*<[\w:-]+[^>]*>[\s\S]*<\/[\w:-]+>\s*$/.test(s) ? 0.5 : 0),
  },
  {
    id: 'sql-formatter', title: 'SQL Formatter', subtitle: 'Format SQL for a dozen dialects.',
    category: 'format', icon: 'table', keywords: ['sql', 'query', 'postgres', 'mysql', 'database'],
    component: () => import('@/pages/tools/SqlFormatter.vue'),
    detect: (s) => (/^\s*(select|insert|update|delete|create|alter|with|drop)\s/i.test(s) ? 0.8 : 0),
  },
  {
    id: 'line-sort', title: 'Line Sort & Dedupe', subtitle: 'Sort, reverse, shuffle and de-duplicate lines.',
    category: 'format', icon: 'sort', keywords: ['lines', 'sort', 'unique', 'dedupe', 'shuffle', 'reverse'],
    component: () => import('@/pages/tools/LineSort.vue'),
    detect: (s) => (lines(s).length > 3 && !/[{}<>]/.test(s) ? 0.15 : 0),
  },

  // ── Convert ──────────────────────────────────────────────────────
  {
    id: 'yaml-to-json', title: 'YAML to JSON', subtitle: 'Convert YAML documents to JSON.',
    category: 'convert', icon: 'swap', keywords: ['yaml', 'yml', 'json', 'convert', 'kubernetes'],
    component: () => import('@/pages/tools/YamlToJson.vue'),
    detect: (s) => (!isJson(s) && /^[\w"'-][\w "'.-]*:\s*(\S|$)/m.test(s) && lines(s).length > 1 && !/[{};]\s*$/m.test(s) ? 0.55 : 0),
  },
  {
    id: 'json-to-yaml', title: 'JSON to YAML', subtitle: 'Convert JSON to readable YAML.',
    category: 'convert', icon: 'swap', keywords: ['json', 'yaml', 'yml', 'convert'],
    component: () => import('@/pages/tools/JsonToYaml.vue'),
    detect: (s) => (isJson(s) ? 0.5 : 0),
  },
  {
    id: 'json-to-csv', title: 'JSON to CSV', subtitle: 'Turn an array of objects into CSV.',
    category: 'convert', icon: 'table', keywords: ['json', 'csv', 'spreadsheet', 'excel', 'convert'],
    component: () => import('@/pages/tools/JsonToCsv.vue'),
    detect: (s) => (isJson(s) && s.trim().startsWith('[') ? 0.6 : 0),
  },
  {
    id: 'csv-to-json', title: 'CSV to JSON', subtitle: 'Parse CSV or TSV into JSON.',
    category: 'convert', icon: 'table', keywords: ['csv', 'tsv', 'json', 'spreadsheet', 'convert'],
    component: () => import('@/pages/tools/CsvToJson.vue'),
    detect: (s) => {
      const l = lines(s)
      if (l.length < 2 || isJson(s)) return 0
      const n = (l[0].match(/,|\t/g) || []).length
      return n > 0 && l.slice(1, 5).every((x) => (x.match(/,|\t/g) || []).length === n) ? 0.7 : 0
    },
  },
  {
    id: 'excel-to-json', title: 'Excel to JSON', subtitle: 'Read .xlsx sheets as JSON.',
    category: 'convert', icon: 'table', keywords: ['excel', 'xlsx', 'xls', 'sheet', 'json'],
    component: () => import('@/pages/tools/ExcelToJson.vue'),
  },
  {
    id: 'number-base', title: 'Number Base Converter', subtitle: 'Binary, octal, decimal, hex and any base.',
    category: 'convert', icon: 'number', keywords: ['binary', 'hex', 'octal', 'decimal', 'radix', 'base'],
    component: () => import('@/pages/tools/NumberBase.vue'),
    detect: (s) => (/^\s*(0x[0-9a-f]+|0b[01]+|0o[0-7]+)\s*$/i.test(s) ? 0.85 : 0),
  },
  {
    id: 'text-case', title: 'String Case Converter', subtitle: 'camelCase, snake_case, Title Case and more.',
    category: 'convert', icon: 'textformat', keywords: ['case', 'camel', 'snake', 'kebab', 'pascal', 'title', 'upper', 'lower', 'text style'],
    component: () => import('@/pages/tools/TextCase.vue'),
    detect: (s) => (/^[a-z]+([A-Z][a-z0-9]*)+$|^[a-z0-9]+(_[a-z0-9]+)+$|^[a-z0-9]+(-[a-z0-9]+)+$/.test(s.trim()) ? 0.6 : 0),
  },
  {
    id: 'html-to-jsx', title: 'HTML to JSX', subtitle: 'Convert HTML markup into valid JSX.',
    category: 'convert', icon: 'code', keywords: ['html', 'jsx', 'react', 'tsx', 'component'],
    component: () => import('@/pages/tools/HtmlToJsx.vue'),
    detect: (s) => (/<\w+[^>]*\s(class|for|style)=/.test(s) ? 0.4 : 0),
  },
  {
    id: 'php-json', title: 'PHP ↔ JSON', subtitle: 'Arrays, serialize() and unserialize() for PHP.',
    category: 'convert', icon: 'swap', keywords: ['php', 'serialize', 'unserialize', 'array', 'json'],
    component: () => import('@/pages/tools/PhpJson.vue'),
    detect: (s) => (/^\s*(a:\d+:\{|O:\d+:"|s:\d+:")/.test(s) ? 0.9 : /^\s*(array\s*\(|\[\s*['"][^'"]*['"]\s*=>)/.test(s) ? 0.8 : 0),
  },
  {
    id: 'svg-to-css', title: 'SVG to CSS', subtitle: 'Embed SVG as a CSS background data URI.',
    category: 'convert', icon: 'image', keywords: ['svg', 'css', 'data uri', 'background', 'icon'],
    component: () => import('@/pages/tools/SvgToCss.vue'),
    detect: (s) => (/^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(s) ? 0.85 : 0),
  },
  {
    id: 'curl-to-code', title: 'cURL to Code', subtitle: 'Turn a curl command into fetch, Python, Go and more.',
    category: 'convert', icon: 'terminal', keywords: ['curl', 'http', 'request', 'fetch', 'axios', 'python', 'go'],
    component: () => import('@/pages/tools/CurlToCode.vue'),
    detect: (s) => (/^\s*curl\s/.test(s) ? 1 : 0),
  },
  {
    id: 'json-to-code', title: 'JSON to Code', subtitle: 'Generate TypeScript, Swift, Go and Kotlin types.',
    category: 'convert', icon: 'braces', keywords: ['json', 'typescript', 'interface', 'swift', 'codable', 'go', 'struct', 'kotlin', 'types'],
    component: () => import('@/pages/tools/JsonToCode.vue'),
    detect: (s) => (isJson(s) && s.trim().startsWith('{') ? 0.45 : 0),
  },
  {
    id: 'hex-ascii', title: 'Hex ↔ ASCII', subtitle: 'Convert between hex bytes and text.',
    category: 'convert', icon: 'number', keywords: ['hex', 'ascii', 'bytes', 'utf8', 'text'],
    component: () => import('@/pages/tools/HexAscii.vue'),
    detect: (s) => {
      const t = s.trim().replace(/\s+/g, '')
      return t.length >= 4 && t.length % 2 === 0 && /^[0-9a-f]+$/i.test(t) && /[a-f]/i.test(t) ? 0.55 : 0
    },
  },

  // ── Inspect & Debug ──────────────────────────────────────────────
  {
    id: 'unix-time', title: 'Unix Time Converter', subtitle: 'Timestamps to dates and back, in any zone.',
    category: 'inspect', icon: 'clock', keywords: ['unix', 'epoch', 'timestamp', 'date', 'time', 'iso'],
    component: () => import('@/pages/tools/UnixTime.vue'),
    detect: (s) => (/^\s*1\d{9}(\d{3})?\s*$/.test(s) ? 0.95 : 0),
  },
  {
    id: 'jwt-debugger', title: 'JWT Debugger', subtitle: 'Decode JSON Web Tokens and verify HMAC signatures.',
    category: 'inspect', icon: 'key', keywords: ['jwt', 'token', 'auth', 'bearer', 'jws', 'oauth'],
    component: () => import('@/pages/tools/JwtDebugger.vue'),
    detect: (s) => (/^\s*(Bearer\s+)?eyJ[\w-]+\.eyJ[\w-]+\.[\w-]*\s*$/.test(s) ? 1 : 0),
  },
  {
    id: 'regex-tester', title: 'RegExp Tester', subtitle: 'Test regular expressions with live highlighting.',
    category: 'inspect', icon: 'regex', keywords: ['regex', 'regexp', 'regular expression', 'match', 'pattern'],
    component: () => import('@/pages/tools/RegexTester.vue'),
    detect: (s) => (/^\/.+\/[gimsuyd]*$/.test(s.trim()) ? 0.85 : 0),
  },
  {
    id: 'html-preview', title: 'HTML Preview', subtitle: 'Render HTML safely in a sandbox.',
    category: 'inspect', icon: 'eye', keywords: ['html', 'preview', 'render', 'sandbox'],
    component: () => import('@/pages/tools/HtmlPreview.vue'),
    detect: (s) => (/^\s*(<!doctype html|<html)/i.test(s) ? 0.5 : 0),
  },
  {
    id: 'text-diff', title: 'Text Diff Checker', subtitle: 'Compare two texts line by line or word by word.',
    category: 'inspect', icon: 'diff', keywords: ['diff', 'compare', 'difference', 'merge', 'patch'],
    component: () => import('@/pages/tools/TextDiff.vue'),
  },
  {
    id: 'string-inspector', title: 'String Inspector', subtitle: 'Count characters, words, bytes and code points.',
    category: 'inspect', icon: 'textformat', keywords: ['count', 'length', 'characters', 'words', 'bytes', 'unicode'],
    component: () => import('@/pages/tools/StringInspector.vue'),
    detect: () => 0.1,
  },
  {
    id: 'markdown-preview', title: 'Markdown Preview', subtitle: 'Live GitHub-flavored Markdown preview.',
    category: 'inspect', icon: 'markdown', keywords: ['markdown', 'md', 'readme', 'preview', 'gfm'],
    component: () => import('@/pages/tools/MarkdownPreview.vue'),
    detect: (s) => (/^#{1,6}\s\S/m.test(s) && /\n/.test(s) ? 0.6 : /\*\*\S|^\s*[-*]\s\S|\[[^\]]+\]\([^)]+\)/m.test(s) ? 0.35 : 0),
  },
  {
    id: 'cron-parser', title: 'Cron Job Parser', subtitle: 'Explain cron schedules and preview next runs.',
    category: 'inspect', icon: 'calendar', keywords: ['cron', 'crontab', 'schedule', 'job'],
    component: () => import('@/pages/tools/CronParser.vue'),
    detect: (s) => (/^\s*([\d*/,\-?LW#A-Z]+\s+){4,5}[\d*/,\-?LW#A-Z]+\s*$/i.test(s) ? 0.9 : 0),
  },
  {
    id: 'color-converter', title: 'Color Converter', subtitle: 'HEX, RGB, HSL, HWB and OKLCH with contrast check.',
    category: 'inspect', icon: 'palette', keywords: ['color', 'colour', 'hex', 'rgb', 'hsl', 'oklch', 'contrast'],
    component: () => import('@/pages/tools/ColorConverter.vue'),
    detect: (s) => (/^\s*(#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(rgb|hsl|hwb|oklch)a?\(.+\))\s*$/i.test(s) ? 0.95 : 0),
  },
  {
    id: 'url-parser', title: 'URL Parser', subtitle: 'Break a URL into parts and query parameters.',
    category: 'inspect', icon: 'globe', keywords: ['url', 'uri', 'query', 'params', 'parse', 'link'],
    component: () => import('@/pages/tools/UrlParser.vue'),
    detect: (s) => (/^\s*[a-z][\w+.-]*:\/\/\S+\s*$/i.test(s) ? 0.8 : 0),
  },

  // ── Generate ─────────────────────────────────────────────────────
  {
    id: 'uuid', title: 'UUID / ULID', subtitle: 'Generate and decode UUID v4, v7 and ULID.',
    category: 'generate', icon: 'fingerprint', keywords: ['uuid', 'guid', 'ulid', 'id', 'unique'],
    component: () => import('@/pages/tools/UuidGenerator.vue'),
    detect: (s) => (/^\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\s*$/i.test(s) || /^\s*[0-7][0-9A-HJKMNP-TV-Z]{25}\s*$/.test(s) ? 0.95 : 0),
  },
  {
    id: 'lorem-ipsum', title: 'Lorem Ipsum', subtitle: 'Placeholder words, sentences and paragraphs.',
    category: 'generate', icon: 'docText', keywords: ['lorem', 'ipsum', 'placeholder', 'dummy', 'text'],
    component: () => import('@/pages/tools/LoremIpsum.vue'),
  },
  {
    id: 'qr-code', title: 'QR Code', subtitle: 'Generate QR codes or read them from images.',
    category: 'generate', icon: 'qrcode', keywords: ['qr', 'qrcode', 'barcode', 'scan', 'reader'],
    component: () => import('@/pages/tools/QrCode.vue'),
  },
  {
    id: 'hash-generator', title: 'Hash Generator', subtitle: 'MD5, SHA-1, SHA-2, SHA-3 and HMAC.',
    category: 'generate', icon: 'hash', keywords: ['hash', 'md5', 'sha', 'sha256', 'sha512', 'hmac', 'checksum'],
    component: () => import('@/pages/tools/HashGenerator.vue'),
  },
  {
    id: 'random-string', title: 'Random String', subtitle: 'Secure random strings and passwords.',
    category: 'generate', icon: 'dice', keywords: ['random', 'password', 'string', 'token', 'secret'],
    component: () => import('@/pages/tools/RandomString.vue'),
  },

  // ── Encode & Decode ──────────────────────────────────────────────
  {
    id: 'base64', title: 'Base64 String', subtitle: 'Encode and decode Base64 text, UTF-8 safe.',
    category: 'encode', icon: 'lock', keywords: ['base64', 'encode', 'decode', 'btoa', 'atob'],
    component: () => import('@/pages/tools/Base64String.vue'),
    detect: (s) => {
      const t = s.trim()
      if (t.length < 8 || !/^[A-Za-z0-9+/_-]+={0,2}$/.test(t) || /^\d+$/.test(t)) return 0
      try { return /^[\x09\x0a\x0d\x20-\x7e]+$/.test(atob(t.replace(/-/g, '+').replace(/_/g, '/'))) ? 0.75 : 0.3 } catch { return 0 }
    },
  },
  {
    id: 'image-base64', title: 'Base64 Image', subtitle: 'Images to data URIs and back.',
    category: 'encode', icon: 'photo', keywords: ['image', 'base64', 'data uri', 'png', 'jpg', 'svg'],
    component: () => import('@/pages/tools/ImageBase64.vue'),
    detect: (s) => (/^\s*data:image\//.test(s) ? 1 : 0),
  },
  {
    id: 'url-encode', title: 'URL Encode', subtitle: 'Percent-encode and decode URL components.',
    category: 'encode', icon: 'percent', keywords: ['url', 'encode', 'decode', 'percent', 'uri', 'escape'],
    component: () => import('@/pages/tools/UrlEncode.vue'),
    detect: (s) => (/%[0-9a-f]{2}/i.test(s) ? 0.85 : 0),
  },
  {
    id: 'html-entity', title: 'HTML Entities', subtitle: 'Escape and unescape HTML entities.',
    category: 'encode', icon: 'ampersand', keywords: ['html', 'entity', 'entities', 'escape', 'unescape', 'amp'],
    component: () => import('@/pages/tools/HtmlEntity.vue'),
    detect: (s) => (/&(#\d+|#x[0-9a-f]+|[a-z]+);/i.test(s) ? 0.7 : 0),
  },
  {
    id: 'backslash-escape', title: 'Backslash Escape', subtitle: 'Escape and unescape strings for code.',
    category: 'encode', icon: 'quote', keywords: ['escape', 'unescape', 'backslash', 'string', 'quote', 'newline'],
    component: () => import('@/pages/tools/BackslashEscape.vue'),
    detect: (s) => (/\\[nrt"'\\]|\\u[0-9a-f]{4}/i.test(s) ? 0.55 : 0),
  },
  {
    id: 'certificate-decoder', title: 'Certificate Decoder', subtitle: 'Inspect and validate X.509 certificates: chain, hostname and private key.',
    category: 'encode', icon: 'certificate', keywords: ['certificate', 'x509', 'ssl', 'tls', 'pem', 'crt', 'validate', 'verify', 'chain', 'private key', 'checker'],
    component: () => import('@/pages/tools/CertificateDecoder.vue'),
    detect: (s) => (/-----BEGIN CERTIFICATE-----/.test(s) ? 1 : 0),
  },
]

tools.forEach((t) => { t.path = `/${t.id}` })

export const toolById = Object.fromEntries(tools.map((t) => [t.id, t]))
export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]))

// Old URLs keep working.
export const legacyRedirects = {
  '/convert-text-style': '/text-case',
  '/base64-converter': '/base64',
  '/url-encode-decode': '/url-encode',
  '/qr-code-generator': '/qr-code',
  '/image-to-base64': '/image-base64',
  '/corn-job-parser': '/cron-parser',
}

export function rankTools (text) {
  if (!text || !text.trim()) return []
  return tools
    .filter((t) => t.detect)
    .map((t) => {
      let score = 0
      try { score = t.detect(text) } catch { score = 0 }
      return { tool: t, score }
    })
    .filter((r) => r.score > 0.2)
    .sort((a, b) => b.score - a.score)
}

export function searchTools (query) {
  const q = query.trim().toLowerCase()
  if (!q) return tools
  const words = q.split(/\s+/)
  return tools
    .map((t) => {
      const hay = [t.title, t.subtitle, ...t.keywords].join(' ').toLowerCase()
      let score = 0
      for (const w of words) {
        if (!hay.includes(w)) return { t, score: -1 }
        if (t.title.toLowerCase().startsWith(w)) score += 3
        else if (t.title.toLowerCase().includes(w)) score += 2
        else if (t.keywords.some((k) => k.startsWith(w))) score += 1.5
        else score += 0.5
      }
      return { t, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.t)
}
