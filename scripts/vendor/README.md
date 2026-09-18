# DOMPurify

`dompurify-3.4.15.min.js` is the official browser distribution of DOMPurify 3.4.15,
retrieved 2026-09-18 from the upstream release tag:

- Release: https://github.com/cure53/DOMPurify/releases/tag/3.4.15
- Browser distribution: https://raw.githubusercontent.com/cure53/DOMPurify/3.4.15/dist/purify.min.js
- License: https://raw.githubusercontent.com/cure53/DOMPurify/3.4.15/LICENSE
- Security policy and updates: https://github.com/cure53/DOMPurify/security

The distribution is used as-is (no build step, CDN or npm runtime required).
Its upstream license header is preserved; `DOMPurify-LICENSE` contains the
upstream Apache-2.0 OR MPL-2.0 licensing terms.

SHA-256:

```text
f263b05369e050fa175d4ecb9c9358eb4253602d510297adfb31df48b2f1c4d5  dompurify-3.4.15.min.js
cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30  DOMPurify-LICENSE
```

The optional upstream source map is not shipped. The minified file retains its
source-map comment; developer tools may report the missing map when debugging.

`scripts/notice.js` restricts allowed elements to Markdown output and removes
URL attributes outside HTTP(S), plus mailto/tel for links. It inserts a sanitized
DOM fragment and fails closed if DOMPurify is missing or unsupported. This is
defense in depth for generated publisher HTML, not evidence of a publisher exploit.
Only Markdown table cells with an exact `text-align: left|center|right` declaration
are converted to an `align` attribute; style attributes remain disallowed.
Attachment and post base directories must resolve to the page's origin.

To update, fetch the current supported upstream release, replace the versioned
browser file and license using apply_patch, update both HTML script references and
the Notice test harness, refresh these hashes, and run `npm run verify`.
The jsdom dev dependency powers real DOM regression tests; it is not served to visitors.
