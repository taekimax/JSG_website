import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTeamApp } from './team-render-harness.mjs';

test('team detail renderer keeps the horizontal portrait layout and bilingual identity block', async () => {
  const manifest = {
    assetVersion: 'contract-1',
    members: [
      { id: 'adv-z', group: 'advisory', order: 20, nameKo: '자문Z', nameEn: 'Adv Z', roleKo: '자문', image: 'assets/team/adv-z.png', highlights: ['advisory'] },
      { id: 'core-b', group: 'core', order: 20, nameKo: '코어B', nameEn: 'Core B', roleKo: '심사역', image: 'assets/team/core-b.png', highlights: ['core'] },
      { id: 'core-a', group: 'core', order: 20, nameKo: '코어A', nameEn: 'Core A', roleKo: '심사역', image: 'assets/team/core-a.png', highlights: ['core'] },
      { id: 'core-c', group: 'core', order: 10, nameKo: '코어C', nameEn: 'Core C', roleKo: '심사역', image: 'assets/team/core-c.png', highlights: ['core'] }
    ]
  };

  const { html } = await renderTeamApp({
    manifest,
    search: '?id=core-a'
  });

  assert.match(html, /class="team-card member-hero-card member-hero-card--stacked"/);
  assert.match(html, /<h1 class="h1-title member-name">코어A/);
  assert.match(html, /class="member-name-en">Core A</);
  assert.match(html, /class="team-card-media team-card-media--portrait"/);
  assert.match(html, /class="member-identity"/);
  assert.match(html, /class="member-pager"/);
  assert.match(html, /class="team-img member-hero-img" loading="eager" decoding="async"/);
  assert.match(html, /class="member-pager-link prev" href="team-member\.html\?id=core-c"/);
  assert.match(html, /class="member-pager-link next" href="team-member\.html\?id=core-b"/);
  assert.match(html, /class="member-pager-team" href="team\.html"/);
});

test('team detail renderer shows missing-member message when id is unknown', async () => {
  const manifest = {
    members: [
      { id: 'core-a', group: 'core', order: 10, nameKo: '코어A', nameEn: 'Core A', roleKo: '심사역', image: 'assets/team/core-a.png', highlights: [] }
    ]
  };

  const { html } = await renderTeamApp({
    manifest,
    search: '?id=not-found'
  });

  assert.match(html, /존재하지 않는 멤버입니다\./);
});
