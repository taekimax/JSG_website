# Security changes — 2026-09-18

Scope: security implementation in `/Volumes/dev/JSG_website` and the related
`/Volumes/dev/jsg-board-content` publishing workflow. Following local verification,
the user authorized committing to main and publishing both changes. The website
release builds on `dcce8fb` (Team role and ordering corrections from another
session), preserving that content edit. Hosting-account changes remain separate.

## Findings and implementation

- **Attachment filename injection:** Notice attachment names previously entered
  `innerHTML` without escaping. Render labels as escaped text and validate paths
  before making download links. Preserve Korean filenames and nested paths.
- **Notice HTML boundary:** the publisher already disables raw Markdown HTML and
  rejects unsafe links; direct HTML insertion alone was not proof of a publisher
  exploit. Add a local, maintained DOMPurify distribution with a Markdown tag and
  attribute allowlist. Insert its sanitized DOM fragment and fail closed if the
  sanitizer is unavailable. Regression tests use a real DOM implementation.
- **Browser headers:** `.htaccess` sets CSP, `nosniff`, framing protection,
  Referrer-Policy, Permissions-Policy and HSTS. Script execution is restricted to
  the site and hashes of the existing inline boot/redirect snippets. No arbitrary
  inline scripts or eval are allowed. Inline styles remain supported because the
  current interface uses them; embedded font data is allowed for the contact map.
  `tools/security-headers.test.mjs` detects stale or missing script hashes.
- **Publishing privileges:** PR validation is read-only. Production publishing
  is restricted to trusted `main` runs; only a separate Perspective preservation
  job receives repository write access. GitHub Actions use verified commit pins,
  dependency lifecycle scripts are disabled, and checkout credentials are not
  persisted. Refresh failure continues to preserve the saved Perspective index
  while allowing validated Notice/Portfolio publication.

## Hosting boundary

On 2026-09-18, `https://jsginvest.com` succeeds but
`https://www.jsginvest.com` fails before an HTTP redirect can be processed. The
existing migration record says the installed certificate covers the apex domain
only and the earlier user decision excluded a `www` certificate change.

HSTS is therefore limited to the responding hostname: no `includeSubDomains` or
preload. Enabling HTTPS on `www` requires Cafe24 to provision/bind a certificate
covering that hostname; changing `.htaccess` cannot repair the TLS handshake.
No certificate, DNS, subscription or hosting-account changes were made here.

## Implementation verification (before publication)

- PASS: website 54 Node tests and asset validation, including malicious filename,
  HTML/protocol injection, traversal, sanitizer failure, and valid Markdown cases.
- PASS: content repository 16 Node tests and 10 Python tests, including the
  companion website workflow guards and executable post-deploy header checks.
- PASS: both Node suites also pass under Node 24.19.0, matching the deployment
  workflow's Node 24 release line; website asset validation passes there too.
- PASS: dependency audit reports zero known vulnerabilities for the website.
  Vendored DOMPurify bytes match the upstream release with recorded SHA-256.
- PASS: local Apache accepts `.htaccess` and returns the expected headers.
  Chrome loads home, Notice, Portfolio and Team detail without CSP violations;
  mobile loading/menu and query/hash redirects work. Malicious Notice body and
  filename fixtures are neutralized, table center/right alignment is preserved,
  and an unexpected inline script is blocked by CSP.
- NOT RUN: production deployment and hosted Actions execution. The deployment
  workflow now checks actual public response headers against staged `.htaccess`,
  rejecting missing, altered or duplicate values. Local tests do not establish
  production activation.

References: [CSP script hashes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src),
[Apache response headers](https://httpd.apache.org/docs/2.4/mod/mod_headers.html),
[HSTS scope](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security).
