#!/usr/bin/env node
/**
 * verify-and-fix.mjs
 * Autonomous QA verification loop for MyFiles Premium Filesystem Explorer.
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;
const failures = [];

function ok(label) { console.log(`  ✅ ${label}`); passed++; }
function fail(label, detail = '') {
  console.error(`  ❌ ${label}${detail ? '\n     ' + detail : ''}`);
  failed++; failures.push(label);
}
function section(title) {
  console.log(`\n${'─'.repeat(60)}\n📋 ${title}\n${'─'.repeat(60)}`);
}
function run(cmd) {
  return spawnSync(cmd, { shell: true, cwd: root, encoding: 'utf8' });
}

// 1. Environment
section('1 · Environment & Dependencies');
try {
  const node = run('node --version');
  if (node.status === 0) ok(`Node.js: ${node.stdout.trim()}`); else fail('node not found');
  const npm = run('npm --version');
  if (npm.status === 0) ok(`npm: ${npm.stdout.trim()}`); else fail('npm not found');

  const nmExists = fs.existsSync(path.join(root, 'node_modules'));
  if (nmExists) ok('node_modules exists');
  else {
    console.log('  ℹ️  Running npm install...');
    const install = run('npm install');
    if (install.status === 0) ok('npm install succeeded');
    else fail('npm install failed', (install.stderr || '').slice(0, 400));
  }

  const pkgJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const allDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
  ['react', 'framer-motion', 'lucide-react', 'express', 'chokidar', 'prismjs'].forEach(pkg => {
    if (allDeps[pkg]) ok(`Dep declared: ${pkg}@${allDeps[pkg]}`);
    else fail(`Missing dep: ${pkg}`);
  });
} catch (err) { fail('Environment check error', err.message); }

// 2. TypeScript
section('2 · TypeScript Typecheck');
try {
  const ts = run('npm run typecheck');
  if (ts.status === 0) ok('tsc --noEmit → 0 errors');
  else fail('TypeScript errors', (ts.stdout || '').slice(0, 600));
} catch (err) { fail('Typecheck error', err.message); }

// 3. ESLint
section('3 · ESLint');
try {
  const lint = run('npm run lint');
  if (lint.status === 0) ok('ESLint → 0 errors, 0 warnings');
  else fail('ESLint problems', (lint.stdout || '').slice(0, 600));
} catch (err) { fail('ESLint error', err.message); }

// 4. Build
section('4 · Production Build');
try {
  const build = run('npm run build');
  if (build.status === 0) {
    const distHtml = path.join(root, 'dist', 'index.html');
    if (fs.existsSync(distHtml)) ok('dist/index.html generated');
    else fail('dist/index.html missing');
    const assets = fs.existsSync(path.join(root, 'dist', 'assets'))
      ? fs.readdirSync(path.join(root, 'dist', 'assets')) : [];
    ok(`dist/assets: ${assets.filter(a=>a.endsWith('.js')).length} JS, ${assets.filter(a=>a.endsWith('.css')).length} CSS`);
  } else fail('Build failed', (build.stderr || '').slice(0, 600));
} catch (err) { fail('Build error', err.message); }

// 5. Resource assets
section('5 · Resource Icon Assets (28 icons)');
const expectedIcons = [
  'apps','archive','backup','bookmarks','chat','cloud','code','database','design',
  'documents','downloads','education','favorites','finance','fonts','games','images',
  'media','music','network','notes','presentation','projects','security','system',
  'trash','unknown','videos'
];
const resourcesDir = path.join(root, 'resources');
try {
  if (!fs.existsSync(resourcesDir)) fail('resources/ directory missing');
  else {
    const missing = expectedIcons.filter(icon => {
      const p = path.join(resourcesDir, `${icon}.png`);
      return !fs.existsSync(p) || fs.statSync(p).size < 100;
    });
    if (missing.length === 0) ok(`All ${expectedIcons.length} icons present and valid`);
    else { ok(`${expectedIcons.length - missing.length}/${expectedIcons.length} icons valid`); fail(`Missing/invalid: ${missing.join(', ')}`); }
  }
} catch (err) { fail('Asset check error', err.message); }

// 6. Themes
section('6 · Theme Definitions (10 themes)');
const expectedThemes = ['Classic Dark','Dark Glow','Midnight','Aurora','Cyber','Glass','Monochrome','Solar','Forest','Ocean'];
const themeFile = path.join(root, 'src', 'themes', 'themeDefinitions.ts');
try {
  if (!fs.existsSync(themeFile)) fail('themeDefinitions.ts missing');
  else {
    const content = fs.readFileSync(themeFile, 'utf8');
    const missing = expectedThemes.filter(t => !content.includes(t));
    if (missing.length === 0) ok(`All ${expectedThemes.length} themes defined`);
    else fail(`Missing themes: ${missing.join(', ')}`);
  }
} catch (err) { fail('Theme check error', err.message); }

// 7. Filesystem Discovery
section('7 · Real Filesystem Discovery');
try {
  const homedir = os.homedir();
  ok(`Home: ${homedir}`);

  const desktopPath = path.join(homedir, 'Desktop');
  if (fs.existsSync(desktopPath)) ok(`Desktop found: ${desktopPath}`);
  else fail('Desktop not found', `Checked: ${desktopPath}`);

  const pwPaths = [path.join(homedir, 'Parallel-World'), '/mnt/parallel-world'];
  const pwFound = pwPaths.find(p => fs.existsSync(p));
  if (pwFound) ok(`Parallel World found: ${pwFound}`);
  else fail('Parallel World not found', `Checked: ${pwPaths.join(', ')}`);

  const w2Paths = [path.join(homedir, '2nd-World'), '/mnt/2nd-world'];
  const w2Found = w2Paths.find(p => fs.existsSync(p));
  if (w2Found) ok(`2nd World found: ${w2Found}`);
  else fail('2nd World not found', `Checked: ${w2Paths.join(', ')}`);

  const discoveryFile = path.join(root, 'server', 'discovery.ts');
  if (fs.existsSync(discoveryFile)) {
    const content = fs.readFileSync(discoveryFile, 'utf8');
    if (content.includes('discoverFilesystem') && content.includes('Parallel-World'))
      ok('server/discovery.ts: all key exports present');
    else fail('server/discovery.ts missing required logic');
  } else fail('server/discovery.ts missing');

  const indexFile = path.join(root, 'server', 'index.ts');
  if (fs.existsSync(indexFile)) {
    const content = fs.readFileSync(indexFile, 'utf8');
    if (content.includes('/api/discovery') && content.includes('/api/browse') && content.includes('/api/watch'))
      ok('server/index.ts: API routes /api/discovery, /api/browse, /api/watch registered');
    else fail('server/index.ts missing required API routes');
  } else fail('server/index.ts missing');

} catch (err) { fail('Filesystem discovery check error', err.message); }

// Summary
console.log(`\n${'═'.repeat(60)}`);
console.log(`📊 VERIFICATION SUMMARY`);
console.log(`${'═'.repeat(60)}`);
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 ALL CHECKS PASSED — MyFiles is production-ready!\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  FAILURES (${failed}):`);
  failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  console.log('');
  process.exit(1);
}
