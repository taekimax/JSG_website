import test from 'node:test';
import assert from 'node:assert/strict';
import { readRepoFile, renderPortfolioApp } from './portfolio-render-harness.mjs';

test('portfolio list preserves ordered names, descriptions and detail links without company logos', async () => {
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
  assert.match(html, /Company A description/);
  assert.match(html, /Company B description/);
  assert.doesNotMatch(html, /<img|portfolio-card-media/);
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

  assert.doesNotMatch(html, /<img|portfolio-detail-media/);
  assert.match(html, /class="portfolio-detail"/);
  assert.match(html, /class="portfolio-detail-name">Company A</);
  assert.match(html, /class="portfolio-detail-body">[\s\S]*First paragraph\.[\s\S]*Second paragraph\./);
  assert.match(html, /href="portfolio\.html" class="portfolio-detail-back"/);
});

test('portfolio retains detail routing after retiring company logo presentation', async () => {
  const [js, css] = await Promise.all([
    readRepoFile('scripts/portfolio.js'),
    readRepoFile('styles/main.css'),
  ]);

  assert.match(js, /URLSearchParams/);
  assert.match(js, /portfolio\.html\?id=/);
  assert.match(js, /portfolio-detail/);
  assert.doesNotMatch(js, /company\.logo/);
  assert.match(css, /\.portfolio-detail\s*\{/);
});

test('home company names grow from the same manifest without logos or description requests', async () => {
  const companies = Array.from({ length: 40 }, (_, index) => ({
    id: `company-${index}`,
    order: index,
    name: index === 39 ? 'R&D <Partners>' : `Company ${index}`,
    sector: 'Health Tech',
    logo: '',
    descriptionText: `assets/portfolio/company-${index}.txt`
  })).reverse();
  const manifest = { assetVersion: 'growth-2', companies };
  const originalOrder = companies.map(company => company.id);
  const { html, jsonRequests, textRequests, heroSrc } = await renderPortfolioApp({ manifest, namesOnly: true });
  assert.deepEqual(jsonRequests, ['assets/portfolio/portfolio-manifest.json']);
  assert.equal(textRequests.length, 0);
  assert.equal(heroSrc, '', 'home company names must not replace the About hero image');
  assert.deepEqual(companies.map(company => company.id), originalOrder);
  const primary = html.split('<ul class="company-name-group" aria-hidden="true">')[0];
  assert.equal((primary.match(/<li>/g) || []).length, 40);
  for (let i = 0; i < 40; i++) assert.match(primary, new RegExp(`href="portfolio\\.html\\?id=company-${i}"`));
  assert.ok(primary.indexOf('id=company-0"') < primary.indexOf('id=company-39"'));
  assert.match(primary, /R&amp;D &lt;Partners&gt;/);
  assert.doesNotMatch(html, /<img/);
  assert.equal((html.match(/tabindex="-1"/g) || []).length, 40, 'only the visual repeat is excluded from keyboard navigation');
});

test('an empty company list has a clear state and an unknown detail ID keeps its recovery link', async () => {
  const { html: names } = await renderPortfolioApp({ manifest: { companies: [] }, namesOnly: true });
  assert.match(names, /등록된 투자회사가 없습니다/);
  const { html: detail } = await renderPortfolioApp({ manifest: { companies: [] }, search: '?id=missing' });
  assert.match(detail, /선택한 포트폴리오를 찾을 수 없습니다/);
  assert.match(detail, /href="portfolio\.html"/);
});
