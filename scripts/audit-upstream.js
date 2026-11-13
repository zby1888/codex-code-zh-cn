#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const UPSTREAM = path.resolve(process.argv[2] || 'upstream-codex');
const OUT = process.argv[3] ? path.resolve(process.argv[3]) : null;
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
const AUDIT_FILES = [
  'codex-rs/tui/src/bottom_pane/command_popup.rs',
  'codex-rs/tui/src/bottom_pane/slash_commands.rs',
  'codex-rs/tui/src/bottom_pane/chat_composer.rs',
  'codex-rs/tui/src/bottom_pane/config_panel.rs',
  'codex-rs/tui/src/config_panel/mod.rs',
  'codex-rs/tui/src/config_panel/render.rs',
  'codex-rs/tui/src/app/config_panel.rs',
  'codex-rs/tui/src/app/provider.rs',
  'codex-rs/tui/src/app/provider/fields.rs',
  'codex-rs/tui/src/app/provider/editor/form.rs',
  'codex-rs/tui/src/app/agent_center/render.rs',
  'codex-rs/tui/src/app/agents_overview_view.rs',
  'codex-rs/tui/src/app/agents_overview_actions.rs',
  'codex-rs/tui/src/app/history_ui.rs',
  'codex-rs/tui/src/onboarding/welcome.rs',
  'codex-rs/tui/src/onboarding/onboarding_screen.rs',
  'codex-rs/tui/src/app/experimental_features.rs',
  'codex-rs/tui/src/app/daemon_menu.rs',
  'codex-rs/tui/src/bottom_pane/approval_overlay.rs',
  'codex-rs/tui/src/bottom_pane/async_questions/render.rs',
  'codex-rs/tui/src/bottom_pane/request_user_input/render.rs',
  'codex-rs/tui/src/app/startup_warnings.rs',
  'codex-rs/tui/src/app/startup_prompts.rs',
  'codex-rs/tui/src/app/recap.rs',
  'codex-rs/tui/src/analytics/summary_panel.rs',
  'codex-rs/tui/src/analytics/task_panel.rs',
  'codex-rs/tui/src/analytics/activity_chart.rs',
  'codex-rs/tui/src/bottom_pane/feedback_view.rs',
  'codex-rs/tui/src/app/feedback_upload.rs',
  'codex-rs/tui/src/app/side_pane.rs',
  'codex-rs/tui/src/sidebar_chooser.rs',
  'codex-rs/tui/src/app/sidebar_close.rs',
  'codex-rs/tui/src/app/side_focus.rs',
];

const dictionary = new Map();
for (const file of DATA_FILES) {
  const entries = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  for (const entry of entries) {
    if (entry && typeof entry.en === 'string' && typeof entry.zh === 'string') {
      dictionary.set(entry.en, entry.zh);
    }
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['tests', 'snapshots', 'target'].includes(entry.name)) continue;
      out.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.rs') &&
               !entry.name.endsWith('_tests.rs') &&
               !entry.name.includes('test_support')) {
      out.push(full);
    }
  }
  return out;
}

function decodeNormal(token) {
  try { return JSON.parse(token); }
  catch {
    return token.slice(1, -1)
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
}

function extract(source, relative) {
  source = source.replace(/#\[cfg\(test\)\]\s*mod\s+(?:tests|test_support)\s*\{[\s\S]*$/m, '');
  const out = [];
  const re = /r(#+)?"([\s\S]*?)"\1|("(?:\\.|[^"\\])*")/gs;
  let match;
  while ((match = re.exec(source))) {
    const value = (match[2] !== undefined ? match[2] : decodeNormal(match[3])).trim();
    if (value.length < 4 || value.length > 700 || !/[A-Za-z]/.test(value)) continue;
    if (/https?:\/\//i.test(value)) continue;
    if (/^[a-z0-9_./\\:-]+$/.test(value)) continue;
    if (/^(expected|assert|failed for|test |input:|got |unexpected|cursor |only |when |if )/i.test(value)) continue;
    if (/^(?:[A-Z_]+|[a-z_]+)$/i.test(value) && value.length < 6) continue;
    const line = source.slice(0, match.index).split('\n').length;
    out.push({ text: value, file: relative, line });
  }
  return out;
}

function isNonLocalizable(text) {
  const value = text.trim();
  if (/^%[A-Za-z0-9_ %-]+$/.test(value)) return true;
  if (/^GPT-[0-9]/i.test(value)) return true;
  if (/^codex-diagnostics-/i.test(value)) return true;
  if (/^(?:Option::deserialize|minLength|maxLength|additionalProperties|-NoProfile)$/.test(value)) return true;
  if (/^(?:tui-project-trust-write-|projects\\.)/.test(value)) return true;
  if (/^(?:app|codex):\\/\\//.test(value)) return true;
  if (/^(?:colors dark light palette|animations motion|welcome hints|statusline footer|title tab window|alerts bell|keymap bindings|burst clipboard|dense comfortable|cwd folder|editor modal|clipboard mouse|collapse_turn_details)/.test(value)) return true;
  if (/^on_plain_char_no_hold/.test(value)) return true;
  const remainder = value
    .replace(/\\{[^}]*\\}/g, '')
    .replace(/%[A-Za-z0-9_]+/g, '')
    .replace(/[0-9\\s:.,%/\\\\_$#-]/g, '');
  return remainder.length === 0;
}

function classify(text) {
  if (dictionary.has(text)) return 'exact';
  if (isNonLocalizable(text)) return 'excluded';
  const keys = [...dictionary.keys()].filter((key) => key.length >= 4 && text.includes(key));
  return keys.length ? 'partial' : 'missing';
}

const unique = new Map();
for (const relative of AUDIT_FILES) {
  const file = path.join(UPSTREAM, relative);
  if (!fs.existsSync(file)) {
    throw new Error('Pinned upstream source file is missing: ' + relative);
  }
  const source = fs.readFileSync(file, 'utf8');
  for (const item of extract(source, relative)) {
    if (!unique.has(item.text)) unique.set(item.text, item);
  }
}

const report = { exact: [], partial: [], missing: [], excluded: [] };
for (const item of unique.values()) report[classify(item.text)].push(item);
for (const list of Object.values(report)) {
  list.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

const lines = [
  '# Codex CLI 0.169.0 静态界面汉化审计',
  '',
  '基准：OpenAI Codex CLI tag rust-v0.169.0；扫描欢迎界面、斜杠命令、设置、权限、提供商、侧边对话、反馈和用量统计等重点 TUI 模块。',
  '注意：提取结果包含部分诊断/内部文本；“部分命中”表示句子中至少有一个翻译片段，不代表整句完整汉化。',
  '',
  '- 唯一候选文本：' + unique.size,
  '- 完整命中：' + report.exact.length,
  '- 部分命中：' + report.partial.length,
  '- 未命中：' + report.missing.length,
  '- 非翻译项（格式符、路径、模型名等）：' + report.excluded.length,
  '',
  '## 未命中候选（最多显示 250 条）',
  '',
];
for (const item of report.missing.slice(0, 250)) {
  lines.push('- **' + item.text.replace(/\n/g, ' ↵ ').replace(/\x60/g, "'") + '** — ' + item.file + ':' + item.line);
}
lines.push('', '## 部分命中候选（最多显示 120 条）', '');
for (const item of report.partial.slice(0, 120)) {
  lines.push('- **' + item.text.replace(/\n/g, ' ↵ ').replace(/\x60/g, "'") + '** — ' + item.file + ':' + item.line);
}
const output = lines.join('\n') + '\n';
if (OUT) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, output);
}
process.stdout.write(output);
