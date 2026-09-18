import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Only visitor-facing files enter the Cafe24 artifact. Local mounts, docs and tools stay out.
export async function stageSite({ root = process.cwd(), output = path.join(root, '_site') } = {}) {
  if (path.resolve(output) === path.resolve(root)) throw new Error('Output must be separate from source');
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });
  const entries = await fs.readdir(root, { withFileTypes: true });
  const publicEntries = entries.filter(entry =>
    (entry.isFile() && entry.name.endsWith('.html')) ||
    (entry.isFile() && entry.name === '.htaccess') ||
    (entry.isDirectory() && ['assets', 'scripts', 'styles', 'admin'].includes(entry.name))
  );
  for (const entry of publicEntries) {
    await fs.cp(path.join(root, entry.name), path.join(output, entry.name), {
      recursive: true,
      filter: async source => !(await fs.lstat(source)).isSymbolicLink()
    });
  }
  return output;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(await stageSite());
}
