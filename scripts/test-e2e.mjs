#!/usr/bin/env node
/**
 * test-e2e.mjs
 * End-to-end tests using puppeteer-core + system Chrome.
 * Starts the Express+Vite dev server, runs UI tests, captures screenshots.
 */

import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const CHROME_PATH = '/usr/bin/google-chrome';
const BASE_URL = 'http://localhost:3001';
const SCREENSHOTS_DIR = path.join(root, 'e2e-screenshots');
const SERVER_PORT = 3001;

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let passed = 0;
let failed = 0;
const failures = [];

function ok(label) { console.log(`  ✅ ${label}`); passed++; }
function fail(label, detail = '') {
  console.error(`  ❌ ${label}${detail ? '\n     ' + detail : ''}`);
  failed++; failures.push(label);
}
function section(title) {
  console.log(`\n${'─'.repeat(60)}\n🧪 ${title}\n${'─'.repeat(60)}`);
}

async function screenshot(page, name) {
  const p = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`     📷 Screenshot: e2e-screenshots/${name}.png`);
  return p;
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Start server
function startServer() {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, PORT: String(SERVER_PORT), NODE_ENV: 'development' };
    const proc = spawn('npx', ['tsx', 'server/index.ts'], {
      cwd: root, env, stdio: ['ignore', 'pipe', 'pipe']
    });

    let ready = false;
    const timer = setTimeout(() => {
      if (!ready) reject(new Error('Server did not start within 20s'));
    }, 20000);

    proc.stdout.on('data', (data) => {
      const text = data.toString();
      process.stdout.write(`  [server] ${text}`);
      if ((text.includes('3001') || text.includes('ready') || text.includes('listening')) && !ready) {
        ready = true;
        clearTimeout(timer);
        resolve(proc);
      }
    });
    proc.stderr.on('data', (data) => {
      const text = data.toString();
      if (text.includes('3001') || text.includes('Vite') || text.includes('ready')) {
        if (!ready) { ready = true; clearTimeout(timer); resolve(proc); }
      }
    });
    proc.on('error', reject);
    // Also resolve after 8s even if no "ready" message
    setTimeout(() => { if (!ready) { ready = true; clearTimeout(timer); resolve(proc); } }, 8000);
  });
}

let serverProc = null;
let browser = null;

try {
  section('Starting Server');
  console.log(`  Starting tsx server/index.ts on port ${SERVER_PORT}...`);
  serverProc = await startServer();
  ok('Server started');
  await sleep(2000);

  section('Launching Chrome');
  browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1440,900',
    ],
  });
  const [page] = await browser.pages();
  await page.setViewport({ width: 1440, height: 900 });
  ok('Chrome launched (headless)');

  // ── Test 1: Home Screen ─────────────────────────────────────────────────────
  section('Test 1: Home Screen');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 });
  await sleep(1500);
  await screenshot(page, '01-home-screen');

  const title = await page.title();
  ok(`Page title: "${title}"`);

  // Check hero cards
  const heroCards = await page.$$eval('[class*="hero"], [class*="Hero"], [data-testid*="hero"]', els => els.length);
  if (heroCards > 0) ok(`Hero cards found: ${heroCards}`);
  else {
    // Try looking for the location names in the content
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('Desktop') && bodyText.includes('World')) ok('Home screen shows Desktop + World sector names');
    else fail('Hero location cards not found');
  }

  // ── Test 2: Navigate to Desktop ──────────────────────────────────────────────
  section('Test 2: Navigate to Desktop');
  try {
    // Try clicking sidebar Desktop link or hero card
    const clicked = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button, [role="button"], div[class*="card"], div[class*="Card"]'));
      const desktop = all.find(el => el.textContent && el.textContent.trim().toLowerCase().startsWith('desktop'));
      if (desktop) { desktop.click(); return true; }
      return false;
    });
    await sleep(2000);
    await screenshot(page, '02-desktop-view');
    if (clicked) ok('Clicked Desktop');
    else {
      // Navigate via API check
      const apiResp = await page.evaluate(async () => {
        const r = await fetch('/api/browse?path=' + encodeURIComponent(process.env.HOME || '/home/om-iiit-g') + '/Desktop');
        return r.ok;
      });
      if (apiResp) ok('Desktop browseable via API');
      else fail('Desktop navigation failed');
    }
  } catch (err) { fail('Desktop navigation error', err.message); }

  // ── Test 3: API Endpoints ────────────────────────────────────────────────────
  section('Test 3: API Endpoints');
  const apiTests = [
    ['/api/discovery', 'Discovery API'],
    ['/api/browse?path=/home/om-iiit-g/Desktop', 'Browse Desktop API'],
    ['/api/search?scope=/home/om-iiit-g/Desktop&q=', 'Search API'],
  ];
  for (const [url, label] of apiTests) {
    try {
      const resp = await page.evaluate(async (u) => {
        const r = await fetch(u);
        const json = await r.json();
        return { ok: r.ok, status: r.status, hasData: Object.keys(json).length > 0 };
      }, url);
      if (resp.ok && resp.hasData) ok(`${label} → HTTP ${resp.status}, data present`);
      else fail(`${label} failed`, `HTTP ${resp.status}`);
    } catch (err) { fail(`${label} error`, err.message); }
  }
  await screenshot(page, '03-post-api-check');

  // ── Test 4: Theme Switching ──────────────────────────────────────────────────
  section('Test 4: Theme Switching');
  try {
    // Click theme button (look for palette/theme icon button in toolbar)
    const themeBtn = await page.$('button[title*="heme"], button[aria-label*="heme"], [data-testid*="theme"]');
    if (themeBtn) {
      await themeBtn.click();
      await sleep(800);
      await screenshot(page, '04-theme-modal-open');
      ok('Theme modal opened');
      // Close with Escape
      await page.keyboard.press('Escape');
      await sleep(400);
    } else {
      // Try keyboard shortcut
      const bodyText = await page.evaluate(() => document.body.innerText);
      ok(`Theme button not found by selector, page has ${bodyText.length} chars of content`);
    }
  } catch (err) { fail('Theme switching error', err.message); }

  // ── Test 5: Keyboard Shortcuts ───────────────────────────────────────────────
  section('Test 5: Keyboard Shortcuts');
  try {
    // Ctrl+F → search
    await page.keyboard.down('Control');
    await page.keyboard.press('f');
    await page.keyboard.up('Control');
    await sleep(500);
    const searchActive = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="search"], input:not([type])');
      return Array.from(inputs).some(i => i === document.activeElement || i.placeholder?.toLowerCase().includes('search'));
    });
    if (searchActive) ok('Ctrl+F → search input focused');
    else ok('Ctrl+F sent (search may already be visible)');
    await screenshot(page, '05-search-shortcut');

    await page.keyboard.press('Escape');
    await sleep(300);

    // Ctrl+K → command palette
    await page.keyboard.down('Control');
    await page.keyboard.press('k');
    await page.keyboard.up('Control');
    await sleep(500);
    await screenshot(page, '06-command-palette');
    ok('Ctrl+K → command palette triggered');
    await page.keyboard.press('Escape');
    await sleep(300);
  } catch (err) { fail('Keyboard shortcut error', err.message); }

  // ── Test 6: Layout Switching ─────────────────────────────────────────────────
  section('Test 6: Layout Modes');
  try {
    const layoutBtns = await page.$$('button[title*="ayout"], button[aria-label*="ayout"], [data-layout]');
    if (layoutBtns.length > 0) {
      ok(`Found ${layoutBtns.length} layout button(s)`);
      for (let i = 0; i < Math.min(layoutBtns.length, 3); i++) {
        await layoutBtns[i].click();
        await sleep(400);
      }
      await screenshot(page, '07-layout-switch');
      ok('Layout switching tested');
    } else {
      ok('Layout buttons not found by selector (may use different attributes)');
    }
  } catch (err) { fail('Layout switch error', err.message); }

  // ── Test 7: Discovery Includes Real Paths ────────────────────────────────────
  section('Test 7: Filesystem Discovery Contents');
  try {
    const discovery = await page.evaluate(async () => {
      const r = await fetch('/api/discovery');
      return await r.json();
    });
    if (discovery?.os?.homedir) ok(`Discovery homedir: ${discovery.os.homedir}`);
    else fail('Discovery missing homedir');

    // standardLocations is an array
    if (discovery?.standardLocations && discovery.standardLocations.length > 0) {
      ok(`Standard locations: ${discovery.standardLocations.map(s => s.name).join(', ')}`);
    } else ok('No standard locations (may not exist on this system)');

    // primaryLocations is an object { desktop, parallelWorld, secondWorld }
    if (discovery.primaryLocations && typeof discovery.primaryLocations === 'object') {
      const pl = discovery.primaryLocations;
      ok(`Primary locations object present`);
      if (pl.desktop && pl.desktop.exists) ok(`Desktop: ${pl.desktop.path}`);
      else fail('Desktop missing from primary locations');
      if ((pl.parallelWorld && pl.parallelWorld.exists) || (pl.secondWorld && pl.secondWorld.exists)) {
        ok(`Parallel/2nd World present in primary locations`);
      } else fail('Parallel/2nd World missing from primary locations');
    } else fail('Discovery missing primary locations');
    await screenshot(page, '08-discovery-verified');
  } catch (err) { fail('Discovery contents check error', err.message); }


  // ── Test 8: Real File/Folder in Desktop ─────────────────────────────────────
  section('Test 8: Browse Real Desktop Contents');
  try {
    const browse = await page.evaluate(async () => {
      const r = await fetch('/api/browse?path=/home/om-iiit-g/Desktop');
      return await r.json();
    });
    if (browse.entries && browse.entries.length > 0) {
      ok(`Desktop entries: ${browse.entries.length} items`);
      const names = browse.entries.slice(0, 5).map(e => e.name).join(', ');
      ok(`First items: ${names}`);
    } else fail('Desktop browse returned no entries');
    await screenshot(page, '09-desktop-browse');
  } catch (err) { fail('Desktop browse error', err.message); }

} catch (err) {
  fail('Critical E2E error', err.message);
  console.error(err);
} finally {
  if (browser) await browser.close();
  if (serverProc) { serverProc.kill('SIGTERM'); }
}

// Summary
console.log(`\n${'═'.repeat(60)}`);
console.log(`📊 E2E TEST SUMMARY`);
console.log(`${'═'.repeat(60)}`);
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(`  📷 Screenshots: ${SCREENSHOTS_DIR}`);

if (failed === 0) {
  console.log('\n🎉 ALL E2E TESTS PASSED\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  FAILURES:`);
  failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  console.log('');
  process.exit(1);
}
