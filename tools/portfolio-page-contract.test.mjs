import test from 'node:test';
import assert from 'node:assert/strict';
import { readRepoFile, renderPortfolioApp } from './portfolio-render-harness.mjs';

test('portfolio list renderer keeps logo-safe media treatment and links to detail views', async () => {
  const manifest = {
    assetVersion: 'contract-1',
    heroImage: 'assets/portfolio/portfolio-hero.jpg',
    companies: [
      {
        id: 'company-a',
        order: 20,
        name: 'Company A',
        sector: 'Health Tech',
        logo: 'assets/portfolio/company-a.png',
        descriptionText: 'assets/portfolio/company-a.txt'
      },
      {
        id: 'company-b',
        order: 10,
        name: 'Company B',
        sector: 'Deep Tech',
        logo: 'assets/portfolio/company-b.png',
        descriptionText: 'assets/portfolio/company-b.txt'
      }
    ]
  };

  const { html } = await renderPortfolioApp({
    manifest,
    descriptions: {
      'assets/portfolio/company-a.txt': 'Company A description',
      'assets/portfolio/company-b.txt': 'Company B description'
    }
  });

  assert.ok(
    html.indexOf('portfolio.html?id=company-b') < html.indexOf('portfolio.html?id=company-a'),
    'expected cards to follow manifest order'
  );
  assert.match(html, /class="portfolio-card portfolio-card--link"/);
  assert.match(html, /href="portfolio\.html\?id=company-b"/);
  assert.match(html, /class="portfolio-img" loading="lazy" decoding="async"/);
  assert.match(html, /class="portfolio-card-media"/);
});

test('portfolio detail renderer shows the selected company profile and back navigation', async () => {
  const manifest = {
    assetVersion: 'contract-1',
    heroImage: 'assets/portfolio/portfolio-hero.jpg',
    companies: [
      {
        id: 'company-a',
        order: 10,
        name: 'Company A',
        sector: 'Health Tech',
        logo: 'assets/portfolio/company-a.png',
        descriptionText: 'assets/portfolio/company-a.txt'
      }
    ]
  };

  const { html } = await renderPortfolioApp({
    manifest,
    descriptions: {
      'assets/portfolio/company-a.txt': 'First paragraph.\n\nSecond paragraph.'
    },
    search: '?id=company-a'
  });

  assert.match(html, /class="portfolio-detail"/);
  assert.match(html, /class="portfolio-detail-name">Company A</);
  assert.match(html, /class="portfolio-detail-body">[\s\S]*First paragraph\.[\s\S]*Second paragraph\./);
  assert.match(html, /href="portfolio\.html" class="portfolio-detail-back"/);
});

test('portfolio runtime and stylesheet support the detail route and contain-safe logo rendering', async () => {
  const [js, css] = await Promise.all([
    readRepoFile('scripts/portfolio.js'),
    readRepoFile('styles/main.css'),
  ]);

  assert.match(js, /URLSearchParams/);
  assert.match(js, /portfolio\.html\?id=/);
  assert.match(js, /portfolio-detail/);
  assert.match(css, /\.portfolio-img\s*\{[\s\S]*?object-fit:\s*contain/);
  assert.match(css, /\.portfolio-detail\s*\{/);
});
