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
    ['run or save reusable prompts and slash', '运行或保存可重复使用的提示词和斜杠'],
    ['commands', '命令'],
    ['describe a task or try one of these', '描述任务或尝试以下命令'],
    ['commands:', '命令：'],
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

test('Codex picker descriptions translate when ANSI styling splits phrases', () => {
  const presets = translate('run or save reusable prompts and slash \x1b[0mcommands');
  assert.ok(presets.includes('运行或保存可重复使用的提示词和斜杠'));
  assert.ok(presets.includes('命令'));

  const presetsWithLeadingSpace = translate('run or save reusable prompts and slash\x1b[0m commands');
  assert.ok(presetsWithLeadingSpace.includes('运行或保存可重复使用的提示词和斜杠'));
  assert.ok(presetsWithLeadingSpace.includes('命令'));

  const welcome = translate('describe a task or try one of these\x1b[0m commands:');
  assert.ok(welcome.includes('描述任务或尝试以下命令'));
  assert.ok(welcome.includes('命令：'));
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
    ['{CODEX_APPS_TOOLS_CACHE_ATTACHMENT_FILENAME} (if available)', '{CODEX_APPS_TOOLS_CACHE_ATTACHMENT_FILENAME}（如有）'],
    ['{CODEX_APP_DIRECTORY_CACHE_ATTACHMENT_FILENAME} (if available)', '{CODEX_APP_DIRECTORY_CACHE_ATTACHMENT_FILENAME}（如有）'],
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


test('Codex 0.169 slash menu descriptions translate when TUI wraps or splits them', () => {
  const cases = [
    ['choose what model and reasoning effort', '选择要使用的模型与推理'],
    ['to use', '强度'],
    ['1.5x speed', '1.5 倍速度'],
    ['include current selection, open files,', '包含当前选中内容和已打开文件，'],
    ['and other context from your IDE', '以及 IDE 中的其他上下文'],
    ['approve one retry of a recent auto-', '批准重试最近一次自动'],
    ['review denial', '审查拒绝的操作'],
    ['configure memory use and', '配置记忆的使用与'],
    ['generation', '生成'],
    ['use skills to improve how Codex', '使用技能提升 Codex 执行'],
    ['performs specific tasks', '特定任务的能力'],
    ['import setup, this project, and recent', '导入设置、本项目及最近的'],
    ['chats from Claude Code', 'Claude Code 对话'],
    ['permanently delete this', '永久删除当前'],
    ['fork the current', '派生当前'],
    ['start or continue a conversation in a', '在新的工作树中开始或继续'],
    ['new worktree', '对话'],
    ['create an AGENTS.md file with', '创建 AGENTS.md 文件，其中'],
    ['instructions for Codex', '包含 Codex 的使用说明'],
    ['summarize conversation to prevent', '总结对话，以避免'],
    ['hitting the context limit', '超出上下文长度限制'],
    ['configure Codex', '配置 Codex'],
    ['preferences', '偏好设置'],
    ['summarize the current conversation', '总结当前对话'],
    ['switch to Plan', '切换到 Plan'],
    ['mode', '模式'],
    ['export the conversation as', '导出当前对话为'],
    ['toggle raw scrollback mode for copy-', '切换原始滚动模式，以便'],
    ['friendly terminal selection', '在终端中方便地选择和复制文本'],
    ['choose the TUI mode', '选择 TUI 模式'],
    ['for the next launch', '供下次启动使用'],
    ['show git diff', '显示 Git 差异'],
    ['including untracked', '包括未跟踪的'],
    ['show current session configuration and', '显示当前会话配置及'],
    ['token usage', 'Token 用量'],
    ['view retained warnings and diagnostic', '查看保留的警告和诊断'],
    ['details', '详情'],
    ['show the current working', '显示当前工作'],
    ['configure which items appear in the', '配置要显示在'],
    ['terminal title', '终端标题中的项目'],
    ['status line', '状态栏中的项目'],
    ['a syntax highlighting theme', '语法高亮主题'],
    ['or hide the terminal pet', '或隐藏终端宠物']
  ];

  for (const [english, chinese] of cases) {
    assert.ok(
      translate(english).includes(chinese),
      `Expected wrapped-menu translation for: ${english}`
    );
  }
});


test('additional Codex slash-menu fragments remain translated across ANSI boundaries', () => {
  const cases = [
    ['and token usage', '及 Token 用量'],
    ['token usage', 'Token 用量'],
    ['view retained warnings', '查看保留的警告'],
    ['and diagnostic', '和诊断'],
    ['export the conversation', '导出当前对话'],
    ['as markdown', '为 Markdown 格式'],
    ['the current chat', '当前对话'],
    ['Codex preferences', 'Codex 偏好设置'],
    ['working directory', '工作目录'],
    ['to Plan mode', '到 Plan 模式'],
    ['the TUI mode for the next launch', '下次启动时使用的 TUI 模式'],
    ['file(s)', '文件'],
    ['show the current', '显示当前'],
    ['resume a saved', '继续已保存的']
  ];
  for (const [english, chinese] of cases) {
    assert.ok(
      translate(english).includes(chinese),
      `Expected additional menu-fragment translation for: ${english}`
    );
  }
});
