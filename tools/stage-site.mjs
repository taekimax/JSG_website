import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Only visitor-facing files enter the Pages artifact. Local mounts, docs and tools stay out.
export async function stageSite({ root = process.cwd(), output = path.join(root, '_site'), githubPages = false } = {}) {
  if (path.resolve(output) === path.resolve(root)) throw new Error('Output must be separate from source');
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });
  const entries = await fs.readdir(root, { withFileTypes: true });
  const publicEntries = entries.filter(entry =>
    (entry.isFile() && entry.name.endsWith('.html')) ||
    (entry.isDirectory() && ['assets', 'scripts', 'styles', 'admin'].includes(entry.name))
  );
  for (const entry of publicEntries) {
    await fs.cp(path.join(root, entry.name), path.join(output, entry.name), {
      recursive: true,
      filter: async source => !(await fs.lstat(source)).isSymbolicLink()
    });
  }
  await fs.writeFile(path.join(output, '.nojekyll'), '');
  if (githubPages) {
    const endpointsPath = path.join(output, 'assets/shared/board-endpoints.json');
    const endpoints = JSON.parse(await fs.readFile(endpointsPath, 'utf8'));
    for (const key of ['noticesManifest', 'perspectiveManifest', 'portfolioManifest']) {
      if (!endpoints[key]?.startsWith('/board-content/')) throw new Error(`Unexpected ${key}`);
      endpoints[key] = `/jsg-public-content${endpoints[key]}`;
    }
    await fs.writeFile(endpointsPath, `${JSON.stringify(endpoints, null, 2)}\n`);
  }
  return output;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(await stageSite({ githubPages: process.argv.includes('--github-pages') }));
}
