import test from 'node:test';
import assert from 'node:assert/strict';
import { readRepoFile } from './portfolio-render-harness.mjs';

test('root and retired landing URLs both lead directly to the existing About page', async () => {
  for (const page of ['index.html', 'landing.html']) {
    const html = await readRepoFile(page);
    assert.match(html, /http-equiv="refresh" content="0; url=about\.html"/);
    assert.match(html, /location\.replace\('about\.html'/);
    assert.match(html, /href="about\.html"/);
    assert.doesNotMatch(html, /landingHero|generated\/|landingAnimation|enterBtn/);
  }
});

test('retired section URLs resolve to the home while portfolio and notice detail IDs remain routable', async () => {
  const home = await readRepoFile('about.html');
  for (const section of ['team', 'philosophy', 'portfolio', 'notice', 'contact']) {
    const html = await readRepoFile(`${section}.html`);
    assert.ok(home.includes(`id="${section}"`));
    assert.ok(html.includes(`location.replace('about.html#${section}')`));
    if (section === 'portfolio' || section === 'notice') {
      assert.ok(html.includes("if (!new URLSearchParams(location.search).get('id'))"));
      assert.ok(html.includes(`id="${section}-app"`));
    } else {
      assert.ok(html.includes(`href="about.html#${section}"`));
    }
  }
});
