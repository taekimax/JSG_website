import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMemberIdsFromLinks, readRepoFile, renderTeamApp } from './team-render-harness.mjs';

test('home Team section delegates team list rendering to team.js', async () => {
  const html = await readRepoFile('about.html');

  assert.match(html, /id="team-member-app"/);
  assert.match(html, /<script src="scripts\/team\.js(?:\?[^"]*)?"><\/script>/);
  assert.doesNotMatch(html, /team-member\.html\?id=/);
});

test('team list renderer uses stacked horizontal bilingual cards with manifest ordering intact', async () => {
  const manifest = {
    assetVersion: 'contract-1',
    heroImage: 'assets/team/team-hero.jpg',
    members: [
      { id: 'adv-z', group: 'advisory', order: 20, nameKo: '자문Z', nameEn: 'Adv Z', roleKo: '자문', image: 'assets/team/adv-z.png', highlights: ['advisory'] },
      { id: 'core-b', group: 'core', order: 20, nameKo: '코어B', nameEn: 'Core B', roleKo: '심사역', image: 'assets/team/core-b.png', highlights: ['core'] },
      { id: 'core-a', group: 'core', order: 20, nameKo: '코어A', nameEn: 'Core A', roleKo: '심사역', image: 'assets/team/core-a.png', highlights: ['core'] },
      { id: 'core-c', group: 'core', order: 10, nameKo: '코어C', nameEn: 'Core C', summaryKo: '한국어 소개', summaryEn: 'English introduction', roleKo: '심사역', image: 'assets/team/core-c.png', highlights: ['core'] }
    ]
  };

  const { html, orderedMembers } = await renderTeamApp({ manifest });

  assert.deepEqual(
    orderedMembers.map((member) => member.id),
    ['core-c', 'core-a', 'core-b', 'adv-z']
  );
  assert.deepEqual(
    extractMemberIdsFromLinks(html.replace(/<div class="partners-group" aria-hidden="true">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/, '</section>')),
    ['core-c', 'core-a', 'core-b', 'adv-z']
  );
  assert.match(html, /class="team-card team-card-link team-card--stacked"/);
  assert.match(html, /class="team-card-media team-card-media--portrait"/);
  assert.match(html, /class="team-card-copy"/);
  assert.match(html, /class="team-name-en"/);
  assert.match(html, /class="team-card-summary" lang="ko">한국어 소개/);
  assert.match(html, /class="team-card-summary" lang="en">English introduction/);
  assert.doesNotMatch(html.split('data-group="advisory"')[1], /team-card-summary/);
  assert.match(html, />Advisors</);
});

test('team detail omits the Partners kicker while retaining the Advisors kicker', async () => {
  const manifest = {
    members: [
      { id: 'core-a', group: 'core', order: 10, nameKo: '코어A', roleKo: '심사역' },
      { id: 'adv-a', group: 'advisory', order: 20, nameKo: '자문A', roleKo: '자문위원' }
    ]
  };

  const core = await renderTeamApp({ manifest, search: '?id=core-a' });
  assert.doesNotMatch(core.html, /member-kicker/);
  assert.doesNotMatch(core.html, />Partners</);

  const advisory = await renderTeamApp({ manifest, search: '?id=adv-a' });
  assert.match(advisory.html, /class="member-kicker">Advisors<\/p>/);
});
