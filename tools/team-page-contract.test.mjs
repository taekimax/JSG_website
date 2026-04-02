import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMemberIdsFromLinks, readRepoFile, renderTeamApp } from './team-render-harness.mjs';

test('team.html delegates team list rendering to team.js', async () => {
  const html = await readRepoFile('team.html');

  assert.match(html, /id="team-member-app"/);
  assert.match(html, /<script src="scripts\/team\.js"><\/script>/);
  assert.doesNotMatch(html, /team-member\.html\?id=/);
});

test('team list renderer honors manifest ordering and portrait media hooks', async () => {
  const manifest = {
    assetVersion: 'contract-1',
    heroImage: 'assets/team/team-hero.jpg',
    members: [
      { id: 'adv-z', group: 'advisory', order: 20, nameKo: '자문Z', nameEn: 'Adv Z', roleKo: '자문', image: 'assets/team/adv-z.png', highlights: ['advisory'] },
      { id: 'core-b', group: 'core', order: 20, nameKo: '코어B', nameEn: 'Core B', roleKo: '심사역', image: 'assets/team/core-b.png', highlights: ['core'] },
      { id: 'core-a', group: 'core', order: 20, nameKo: '코어A', nameEn: 'Core A', roleKo: '심사역', image: 'assets/team/core-a.png', highlights: ['core'] },
      { id: 'core-c', group: 'core', order: 10, nameKo: '코어C', nameEn: 'Core C', roleKo: '심사역', image: 'assets/team/core-c.png', highlights: ['core'] }
    ]
  };

  const { html, orderedMembers } = await renderTeamApp({ manifest });

  assert.deepEqual(
    orderedMembers.map((member) => member.id),
    ['core-c', 'core-a', 'core-b', 'adv-z']
  );
  assert.deepEqual(
    extractMemberIdsFromLinks(html),
    ['core-c', 'core-a', 'core-b', 'adv-z']
  );
  assert.match(html, /class="team-card team-card-link"/);
  assert.match(html, /class="team-card-media"/);
  assert.match(html, /class="team-img" loading="lazy" decoding="async"/);
  assert.match(html, /Core Team/);
  assert.match(html, /Advisory Board/);
});
