# JSG Investment Website

Static multi-page HTML/CSS/JS site for JSG Investment. For design tokens and UX rules see agents.md.

## Local development
- Serve from project root over HTTP; opening HTML via file:// will block the notice fetch and shows "공지사항을 불러올 수 없습니다."
- Example: python -m http.server 8000 then open http://localhost:8000/notice.html (or other pages).
- Assets are expected relative to root: data/, images/, styles/, scripts/.

## Structure
- Pages: landing.html, index.html (redirect), about.html, team.html, philosophy.html, portfolio.html, notice.html, contact.html.
- Styles: styles/tokens.css, styles/reset.css, styles/layout.css, styles/main.css.
- Scripts: scripts/ui.js, scripts/notice.js, scripts/landingAnimation.js.
- Data: data/notices.json (+ optional data/uploads/ attachments).

## Notices troubleshooting
- notice.js fetches data/notices.json; if the request fails (missing file, wrong path, or not served over HTTP), the page renders the error state.
- Ensure data/notices.json is present and reachable when serving locally or deploying.
