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

test('portfolio detail renderer shows the selected company profile and shared navigation', async () => {
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
  assert.match(html, /class="detail-pager"/);
  assert.doesNotMatch(html, /portfolio-detail-back/);
});

test('portfolio retains detail routing without the retired local logo field', async () => {
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
  assert.deepEqual(jsonRequests, ['assets/shared/board-endpoints.json', '/board-content/portfolio-manifest.json']);
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
  assert.match(detail, /href="about\.html#portfolio"/);
});


test('company detail navigation follows manifest order and stops at each end', async () => {
  const companies = [
    { id: 'last', order: 30, name: 'Last', descriptionText: 'last.txt' },
    { id: 'first', order: 10, name: 'First', descriptionText: 'first.txt' },
    { id: 'middle', order: 20, name: 'R&D <Company>', descriptionText: 'middle.txt' },
  ];
  const descriptions = { 'first.txt': 'First business', 'middle.txt': 'Middle business', 'last.txt': 'Last business' };
  for (const [id, neighbors] of [['first', ['middle']], ['middle', ['first', 'last']], ['last', ['middle']]]) {
    const { html } = await renderPortfolioApp({ manifest: { companies }, descriptions, search: `?id=${id}` });
    const links = [...html.matchAll(/href="portfolio\.html\?id=([^"&]+)"/g)].map(match => match[1]);
    assert.deepEqual(links, neighbors);
    assert.match(html, /<nav class="detail-pager" aria-label="Portfolio navigation">/);
    assert.doesNotMatch(html, /portfolio-detail-back|<button/);
    if (id !== 'middle') assert.match(html, /R&amp;D &lt;Company&gt;/);
  }
});

test('market badges follow explicit KOSDAQ/KOSPI fields and do not invent listings', async () => {
  const companies = [
    { id: 'kosdaq', name: '코스닥기업', market: 'KOSDAQ' },
    { id: 'kospi', name: '유가증권기업', market: 'KOSPI' },
    { id: 'private', name: '비상장기업', market: '' },
    { id: 'unsafe', name: '검증안됨', market: '<img src=x>' },
  ];
  const { html } = await renderPortfolioApp({ manifest: { companies }, namesOnly: true });
  const primary = html.split('<ul class="company-name-group" aria-hidden="true">')[0];
  assert.equal((primary.match(/company-market-badge/g) || []).length, 2);
  assert.match(primary, /코스닥기업\s*<span class="company-market-badge">KOSDAQ<\/span>/);
  assert.match(primary, /유가증권기업\s*<span class="company-market-badge">KOSPI<\/span>/);
  assert.doesNotMatch(primary, /<img|비상장기업<span/);
});

test('company detail renders versioned CI and official website while rejecting unsafe links', async () => {
  const company = { id: 'a', name: 'R&D', sector: 'Tech', descriptionText: 'a.txt', ciImage: '/board-content/portfolio-ci/a.svg', ciMonochrome: true };
  for (const [websiteUrl, visible] of [['https://example.com/about', true], ['javascript:alert(1)', false], ['https://user:pass@example.com', false], ['', false]]) {
    const { html } = await renderPortfolioApp({ manifest: { assetVersion: 'ci-2', companies: [{ ...company, websiteUrl }] }, descriptions: { 'a.txt': 'Company business.' }, search: '?id=a' });
    assert.match(html, /src="\/board-content\/portfolio-ci\/a.svg\?v=ci-2" alt="R&amp;D CI" class="ci-monochrome"/);
    assert.match(html, /portfolio-profile-header/);
    assert.equal(html.includes('class="portfolio-website"'), visible);
    if (visible) {
      assert.ok(html.indexOf('Company business.') < html.indexOf('class="portfolio-website"'));
      assert.match(html, /target="_blank" rel="noopener noreferrer"/);
    }
  }
});
