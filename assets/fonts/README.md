# Bundled web fonts

Served from this site through `styles/tokens.css`, with no CDN or system-installed font dependency. Both font files are unmodified upstream assets. The main HTML pages preload them; `font-display: swap` shows fallback text during first download.

- `PretendardVariable.woff2` — Pretendard 1.3.9; 2,057,688 bytes. [Pinned source](https://raw.githubusercontent.com/orioncactus/pretendard/v1.3.9/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2). SHA-256: `9599f12fd42fc0bce1cd50b47a0c022e108d7aa64dd0d1bb0ed44f3282d900b4`.
- `JetBrainsMonoNerdFont-Regular.ttf` — Nerd Fonts 3.5.1 / JetBrains Mono 2.304; 2,571,596 bytes. [Pinned source](https://raw.githubusercontent.com/ryanoasis/nerd-fonts/v3.5.1/patched-fonts/JetBrainsMono/Ligatures/JetBrainsMonoNerdFont-Regular.ttf). SHA-256: `1c680e8cde9fcf8b88a5605ce8d1fb94dd3fb15841f7ca7bf4c55664855e5611`.

Pretendard is the Korean/English body font and the company logo wordmark (SemiBold 600). JetBrainsMono NF Regular 400 is the original fixed-width family, not Propo; it is used for navigation, English section headings and portfolio company names. Korean glyphs fall back to the bundled Pretendard. The About company introduction keeps its existing 12px label, 14px copy and 20px wordmark.

Licenses and attribution: `Pretendard-OFL.txt`, `JetBrainsMono-OFL.txt`, `NerdFonts-LICENSE.txt`, `NerdFonts-JetBrainsMono-README.md`. The full Nerd font is retained, including its icon glyphs. Total font payload is approximately 4.6 MB before HTTP compression and is cached by browsers according to hosting settings.
