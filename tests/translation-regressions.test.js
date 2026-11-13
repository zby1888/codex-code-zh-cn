'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { StreamTranslator } = require('../lib/translator');

const ROOT = path.join(__dirname, '..');
const DATA_FILES = [
  'data/ui-translations.json',
  'data/ui-translations-extra.json',
  'data/ui-translations-0169.json',
  'data/ui-translations-slash.json',
  'data/ui-translations-words.json',
  'data/ui-translations-source.json',
  'data/ui-patterns.json',
  'verbs/zh-CN.json',
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
    ['Yes, just this once', '是，仅此一次'],
    ['Sign in to your gateway', '登录你的网关'],
    ['Profile statistics unavailable.', '无法获取个人统计信息。'],
    ['Ask Codex to do anything', '告诉 Codex 你想做什么'],
    ['Weekly', '每周'],
    ['No token activity in the last 12 months', '过去 12 个月没有 Token 活动'],
    ['Rename ›', '重命名 ›'],
    ['Side chat', '侧边对话'],
    ['No choices', '没有可选项'],
    ['Type to search settings', '输入以搜索设置'],
    ['Unrecognized command \'/{name}\'. Type \"/\" for a list of supported commands.', '无法识别命令 \'/{name}\'。输入 \"/\" 查看支持的命令列表。'],
    ['Message too long; limit {MAX_USER_INPUT_TEXT_CHARS} characters', '消息过长；上限为 {MAX_USER_INPUT_TEXT_CHARS} 个字符'],
    ['This will {}. {verb} “{}”?', '这将{}。{verb}“{}”？'],
    ['Could not {verb} task', '无法{verb}任务'],
    ['Start in Vim mode', '以 Vim 模式启动'],
    ['Resume directory', '恢复会话目录'],
    ['Send in 5s', '5 秒后发送'],
    ['app server unavailable', '应用服务器不可用'],
    ['[Skill]', '[技能]'],
    ['{seconds}s', '{seconds} 秒'],
    ['image dimensions={}x{}', '图像尺寸={}x{}'],
    ['Archive task', '归档任务'],
    ['Archive task and child agents', '归档任务及其子代理'],
    ['• Feedback uploaded.', '• 反馈已上传。'],
    ['Files may contain prompts, commands, and tool output:', '文件可能包含提示词、命令和工具输出：'],
    ['Notify only while you are away or while this terminal is focused too', '仅在你离开时通知，或在终端聚焦时也通知'],
    ['Failed to set trust for {}: {error}', '设置 {} 的信任状态失败：{error}'],
    ['failed to invoke `open`: {err}', '调用 `open` 失败：{err}'],
    ['`open {url}` exited with {status}', '`open {url}` 已退出，状态码：{status}'],
    ['Permanently delete task and child agents', '永久删除任务及其子代理'],
    ['No recent local chats.', '没有近期本地会话。'],
    ['This stops any running work in this task and archives it. Child agents stay unchanged. Its history can be restored from the resume picker.', '这会停止此任务中正在运行的工作并将其归档。子代理不受影响。可从恢复会话选择器中恢复其历史记录。'],
    ['Message too long; limit {MAX_USER_INPUT_TEXT_CHARS} characters', '消息过长；上限为 {MAX_USER_INPUT_TEXT_CHARS} 个字符'],
    ['Failed to save feedback ZIP', '反馈 ZIP 保存失败'],
    ['Open in sidebar', '在侧边栏中打开'],
    ['Animations', '动画'],
    ['[x] On', '[x] 开启'],
    ['This will {}. {verb} “{}”?', '这将{}。{verb}“{}”？'],
  ];

  for (const [english, chinese] of cases) {
    assert.ok(
      translate(english).includes(chinese),
      `Expected 0.169.0 translation for: ${english}`
    );
  }
});
