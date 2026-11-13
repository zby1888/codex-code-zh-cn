#!/usr/bin/env node
'use strict';

const { setLanguage, settingsPath } = require('../lib/settings');
const value = String(process.argv[2] || '').toLowerCase();
const language = ['zh', 'zh-cn', 'chinese'].includes(value) ? 'zh-CN' :
  ['en', 'english'].includes(value) ? 'en' : null;
if (!language) {
  process.stderr.write('Usage: codex-zh-language zh-CN|en\n');
  process.exit(2);
}
try {
  setLanguage(language);
  process.stdout.write('codex-zh language saved: ' + language + ' (' + settingsPath() + ')\n');
} catch (error) {
  process.stderr.write('codex-zh-language: ' + error.message + '\n');
  process.exit(1);
}
