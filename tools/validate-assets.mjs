#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const assetsRoot = path.join(repoRoot, 'assets');

const errors = [];
const warnings = [];

const isKebabCaseId = (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ''));

const basenameWithoutExt = (relativePath) => {
  const normalized = String(relativePath || '').replaceAll('\\', '/');
  const base = normalized.split('/').pop() || '';
  const lastDot = base.lastIndexOf('.');
  return lastDot > 0 ? base.slice(0, lastDot) : base;
};

const extLower = (relativePath) => {
  const normalized = String(relativePath || '').replaceAll('\\', '/');
  const base = normalized.split('/').pop() || '';
  const lastDot = base.lastIndexOf('.');
  return lastDot > 0 ? base.slice(lastDot + 1).toLowerCase() : '';
};

const isAllowedImageExt = (relativePath) => {
  const ext = extLower(relativePath);
  return ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext);
};

const fileExists = async (absolutePath) => {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
};

const readJson = async (absolutePath) => {
  const raw = await fs.readFile(absolutePath, 'utf8');
  return JSON.parse(raw);
};

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(full)));
    } else {
      results.push(full);
    }
  }

  return results;
};

const collectPathRefs = (value) => {
  const refs = [];

  const visit = (node) => {
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }

    if (node && typeof node === 'object') {
      for (const key of Object.keys(node)) visit(node[key]);
      return;
    }

    if (typeof node === 'string') {
      const str = node.trim();
      if (!str) return;
      if (str.includes('://')) return;
      if (str.startsWith('/')) {
        errors.push(`Disallowed leading "/" in path reference: ${str}`);
        return;
      }
      if (str.includes('..')) {
        errors.push(`Disallowed ".." in path reference: ${str}`);
        return;
      }
      if (str.startsWith('assets/') || str.startsWith('data/')) refs.push(str);
    }
  };

  visit(value);
  return refs;
};

const collectPathRefsFromManifest = (manifest) => {
  const refs = [];

  const visit = (node, keyName) => {
    if (keyName === '$schema') return;

    if (Array.isArray(node)) {
      for (const item of node) visit(item, keyName);
      return;
    }

    if (node && typeof node === 'object') {
      for (const key of Object.keys(node)) visit(node[key], key);
      return;
    }

    if (typeof node === 'string') {
      const str = node.trim();
      if (!str) return;
      if (str.includes('://')) return;
      if (str.startsWith('/')) {
        errors.push(`Disallowed leading "/" in path reference: ${str}`);
        return;
      }
      if (str.includes('..')) {
        errors.push(`Disallowed ".." in path reference: ${str}`);
        return;
      }
      if (str.startsWith('assets/') || str.startsWith('data/')) refs.push(str);
    }
  };

  visit(manifest, undefined);
  return refs;
};

const validateMembers = (manifestPath, members) => {
  if (!Array.isArray(members)) {
    errors.push(`${manifestPath}: "members" must be an array`);
    return;
  }

  const ids = new Set();
  const perGroupOrders = new Map();
  const allowedGroups = new Set(['core', 'advisory']);

  for (const [index, member] of members.entries()) {
    const where = `${manifestPath}: members[${index}]`;

    if (!member || typeof member !== 'object') {
      errors.push(`${where} must be an object`);
      continue;
    }

    for (const key of ['id', 'group', 'order', 'nameKo', 'roleKo', 'image']) {
      if (!(key in member)) errors.push(`${where} missing required field "${key}"`);
    }

    if (member.id) {
      if (!isKebabCaseId(member.id)) errors.push(`${where} id must be kebab-case: ${member.id}`);
      if (ids.has(member.id)) errors.push(`${where} duplicate id: ${member.id}`);
      ids.add(member.id);
    }

    if (member.group && !allowedGroups.has(member.group)) {
      errors.push(`${where} group must be one of: core, advisory (got: ${member.group})`);
    }

    if (typeof member.image === 'string' && member.image.trim()) {
      if (!member.image.replaceAll('\\', '/').startsWith('assets/team/')) {
        errors.push(`${where} image must be under assets/team/ (got: ${member.image})`);
      }

      if (!isAllowedImageExt(member.image)) {
        errors.push(`${where} image must be one of .png/.jpg/.jpeg/.webp/.svg (got: ${member.image})`);
      }

      if (member.id && basenameWithoutExt(member.image) !== member.id) {
        errors.push(`${where} image filename base must equal id (id=${member.id}, image=${member.image})`);
      }
    }

    if (typeof member.order !== 'number' || Number.isNaN(member.order)) {
      errors.push(`${where} order must be a number`);
    } else {
      const groupKey = member.group || '__ungrouped__';
      if (!perGroupOrders.has(groupKey)) perGroupOrders.set(groupKey, new Set());
      const set = perGroupOrders.get(groupKey);
      if (set.has(member.order)) errors.push(`${where} duplicate order ${member.order} within group ${groupKey}`);
      set.add(member.order);
    }
  }
};

const validateCompanies = (manifestPath, companies) => {
  if (!Array.isArray(companies)) {
    errors.push(`${manifestPath}: "companies" must be an array`);
    return;
  }

  const ids = new Set();
  const orders = new Set();

  for (const [index, company] of companies.entries()) {
    const where = `${manifestPath}: companies[${index}]`;

    if (!company || typeof company !== 'object') {
      errors.push(`${where} must be an object`);
      continue;
    }

    for (const key of ['id', 'order', 'name', 'sector', 'logo', 'descriptionText']) {
      if (!(key in company)) errors.push(`${where} missing required field "${key}"`);
    }

    if (company.id) {
      if (!isKebabCaseId(company.id)) errors.push(`${where} id must be kebab-case: ${company.id}`);
      if (ids.has(company.id)) errors.push(`${where} duplicate id: ${company.id}`);
      ids.add(company.id);
    }

    if (typeof company.order !== 'number' || Number.isNaN(company.order)) {
      errors.push(`${where} order must be a number`);
    } else {
      if (orders.has(company.order)) errors.push(`${where} duplicate order ${company.order}`);
      orders.add(company.order);
    }

    if (typeof company.logo === 'string' && company.logo.trim()) {
      if (!company.logo.replaceAll('\\', '/').startsWith('assets/portfolio/')) {
        errors.push(`${where} logo must be under assets/portfolio/ (got: ${company.logo})`);
      }

      if (!isAllowedImageExt(company.logo)) {
        errors.push(`${where} logo must be one of .png/.jpg/.jpeg/.webp/.svg (got: ${company.logo})`);
      }

      if (company.id && basenameWithoutExt(company.logo) !== company.id) {
        errors.push(`${where} logo filename base must equal id (id=${company.id}, logo=${company.logo})`);
      }
    }

    if ('descriptionHtml' in company) {
      errors.push(`${where} descriptionHtml is not allowed; use descriptionText (.txt)`);
    }

    if ('description' in company) {
      errors.push(`${where} description is not allowed; use descriptionText (.txt)`);
    }

    if (typeof company.descriptionText !== 'string' || !company.descriptionText.trim()) {
      errors.push(`${where} descriptionText must be a non-empty string path to a .txt file`);
    } else if (!company.descriptionText.toLowerCase().endsWith('.txt')) {
      errors.push(`${where} descriptionText must point to a .txt file (got: ${company.descriptionText})`);
    }
  }
};

const main = async () => {
  if (!(await fileExists(assetsRoot))) {
    errors.push(`Missing required directory: ${assetsRoot}`);
    errors.push('Run this validator after creating assets/ during the migration.');
    throw new Error('assets/ missing');
  }

  const allFiles = await walk(assetsRoot);
  const manifests = allFiles.filter((p) => path.basename(p).toLowerCase().endsWith('-manifest.json'));

  if (manifests.length === 0) {
    errors.push('No *-manifest.json files found under assets/.');
  }

  const referenced = new Set();

  for (const manifestAbs of manifests) {
    const manifestRel = path.relative(repoRoot, manifestAbs).replaceAll('\\', '/');

    let manifest;
    try {
      manifest = await readJson(manifestAbs);
    } catch (e) {
      errors.push(`${manifestRel}: invalid JSON (${e.message})`);
      continue;
    }

    for (const key of ['schemaVersion', 'page', 'assetVersion']) {
      if (!(key in manifest)) errors.push(`${manifestRel}: missing required key "${key}"`);
    }

    const folderName = path.basename(path.dirname(manifestAbs));
    const expectedName = `${folderName}-manifest.json`;
    const actualName = path.basename(manifestAbs).toLowerCase();
    if (actualName !== expectedName) {
      errors.push(`${manifestRel}: manifest filename must be ${expectedName}`);
    }
    const page = String(manifest.page || '').trim();
    if (page && page !== folderName) {
      errors.push(`${manifestRel}: "page" must match folder name (page=${page}, folder=${folderName})`);
    }

    if ('members' in manifest) validateMembers(manifestRel, manifest.members);
    if ('companies' in manifest) validateCompanies(manifestRel, manifest.companies);

    for (const ref of collectPathRefsFromManifest(manifest)) referenced.add(ref);
  }

  // Board content is owned by the separate private repository and served from one fixed path.
  const boardEndpointsPath = path.join(assetsRoot, 'shared/board-endpoints.json');
  if (!(await fileExists(boardEndpointsPath))) {
    errors.push('Missing required file: assets/shared/board-endpoints.json');
  } else {
    try {
      const endpoints = await readJson(boardEndpointsPath);
      if (endpoints.schemaVersion !== 1) errors.push('assets/shared/board-endpoints.json: schemaVersion must be 1');
      if (endpoints.noticesManifest !== '/board-content/notices-manifest.json') {
        errors.push('assets/shared/board-endpoints.json: unexpected Notice manifest endpoint');
      }
      if (endpoints.perspectiveManifest !== '/board-content/perspective-manifest.json') {
        errors.push('assets/shared/board-endpoints.json: unexpected Perspective manifest endpoint');
      }
    } catch (e) {
      errors.push(`assets/shared/board-endpoints.json: invalid JSON (${e.message})`);
    }
  }

  for (const relative of [
    'assets/notices/notices-manifest.json',
    'assets/notices/notices.json',
    'assets/notices/source',
    'assets/notices/posts',
    'assets/notices/attachments',
    'assets/philosophy/posts.json',
    'assets/philosophy/mock-posts.json'
  ]) {
    if (await fileExists(path.join(repoRoot, relative))) {
      errors.push(`Board content must stay in jsg-board-content: ${relative}`);
    }
  }

  // Check referenced files exist
  for (const relPath of referenced) {
    const normalizedRel = relPath.replaceAll('\\', '/');
    const abs = path.join(repoRoot, normalizedRel);

    if (!(await fileExists(abs))) {
      errors.push(`Missing referenced file: ${normalizedRel}`);
      continue;
    }

    if (normalizedRel.toLowerCase().endsWith('.html')) {
      errors.push(`HTML fragments are not allowed in manifests; use .txt instead (${normalizedRel})`);
    }
  }

  if (warnings.length) {
    console.log('Warnings:');
    for (const w of warnings) console.log(`- ${w}`);
    console.log('');
  }

  if (errors.length) {
    console.error('Validation failed:');
    for (const e of errors) console.error(`- ${e}`);
    process.exit(1);
  }

  console.log('Validation passed.');
};

main().catch(() => {
  if (errors.length) {
    console.error('Validation failed:');
    for (const e of errors) console.error(`- ${e}`);
  }
  process.exit(1);
});
