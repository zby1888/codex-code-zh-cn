'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { StreamTranslator } = require('../lib/translator');

const ROOT = path.join(__dirname, '..');
const DATA_FILES = [
  'data/ui-translations-slash.json',
  'data/ui-translations-0169.json',
  'data/ui-translations-source.json',
];
const ENTRIES = DATA_FILES.flatMap((file) =>
  JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'))
);

function translate(text) {
  let output = '';
  const translator = new StreamTranslator(ENTRIES, (chunk) => { output += chunk; }, {
    flushIntervalMs: 0,
  });
  translator.feed(text);
  translator.end();
  return output;
}

test('Codex 0.169 welcome and slash-command descriptions have Chinese coverage', () => {
  const cases = [
    ['describe a task or try one of these commands:', '描述任务或尝试以下命令之一：'],
    ['show current session configuration', '显示当前会话配置'],
    ['review any changes and find issues', '审查任何更改并查找问题'],
    ['create an AGENTS.md file with instructions for', '创建包含 Codex 说明的 AGENTS.md 文件'],
    ['summarize conversation to prevent hitting', '压缩会话摘要，避免触达'],
    ['the context limit', '上下文上限'],
  ];

  for (const [english, chinese] of cases) {
    assert.ok(
      translate(english).includes(chinese),
      `Expected translation for: ${english}`
    );
  }
});

test('Codex 0.169 new TUI panels and permission prompts have Chinese coverage', () => {
  const cases = [
    ['Agent command center', '代理命令中心'],
    ['Collapse turn details', '折叠轮次详情'],
    ['Create a custom provider or gateway', '创建自定义提供商或网关'],
    ['Loading side chats…', '正在加载侧边对话…'],
    ['Would you like to run the following command?', '是否运行以下命令？'],
    ['Yes, just this once', '是，仅此次允许'],
    ['Sign in to your gateway', '登录你的网关'],
    ['Profile statistics unavailable.', '无法获取个人统计信息。'],
    ['Ask Codex to do anything', '告诉 Codex 你想做什么'],
  ];

  for (const [english, chinese] of cases) {
    assert.ok(
      translate(english).includes(chinese),
      `Expected 0.169.0 translation for: ${english}`
    );
  }
});
