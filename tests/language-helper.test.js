'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const HELPER = path.join(ROOT, 'bin', 'codex-zh-language.js');

test('codex-zh-language writes only the wrapper-owned language setting', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-zh-language-'));
  try {
    const env = { ...process.env, CODEX_ZH_HOME: home };
    const zh = spawnSync(process.execPath, [HELPER, 'zh-CN'], { env, encoding: 'utf8' });
    assert.equal(zh.status, 0, zh.stderr);
    const file = path.join(home, 'settings.json');
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { language: 'zh-CN' });

    const en = spawnSync(process.execPath, [HELPER, 'en'], { env, encoding: 'utf8' });
    assert.equal(en.status, 0, en.stderr);
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { language: 'en' });
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('codex-zh-language rejects unsupported values', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-zh-language-'));
  try {
    const result = spawnSync(process.execPath, [HELPER, 'fr'], {
      env: { ...process.env, CODEX_ZH_HOME: home },
      encoding: 'utf8',
    });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Usage:/);
    assert.equal(fs.existsSync(path.join(home, 'settings.json')), false);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
