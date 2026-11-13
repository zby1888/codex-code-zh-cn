'use strict';

/**
 * language-toggle.js — 在输入字节流里识别包装器专用的语言切换命令。
 *
 * 除传统 CR/LF 外，也识别 CSI-u 编码的 Enter（例如 ESC [ 13 ; 1 u）。
 * Codex TUI 在启用增强键盘协议时可能使用这种编码；若不解析，命令检测器
 * 会把数字和分号误当作输入内容，导致设置只能等到输出错误时才被保存。
 */

function createToggleDetector(apply) {
  let line = '';
  let escapeState = 'text';
  let csi = '';

  function handleEnter() {
    const m = /^\/(chinese|zh|english|en|language|lang)$/i.exec(line.trim());
    if (m) {
      const lang = /^(chinese|zh)$/i.test(m[1])
        ? 'zh-CN'
        : /^(english|en)$/i.test(m[1])
          ? 'en'
          : null;
      apply(lang, m[1]);
    }
    line = '';
  }

  function handleBackspace() {
    line = line.slice(0, -1);
  }

  return function feed(data) {
    const text = Buffer.isBuffer(data) ? data.toString('utf8') : String(data);
    for (const ch of text) {
      const cp = ch.codePointAt(0);

      if (escapeState === 'esc') {
        if (ch === '[') {
          escapeState = 'csi';
          csi = '';
        } else if (ch === 'O') {
          escapeState = 'ss3';
        } else {
          escapeState = 'text';
        }
        continue;
      }

      if (escapeState === 'ss3') {
        escapeState = 'text';
        continue;
      }

      if (escapeState === 'csi') {
        csi += ch;
        if (cp >= 0x40 && cp <= 0x7e) {
          if (ch === 'u') {
            const keyCode = Number(csi.slice(0, -1).split(';')[0]);
            if (keyCode === 13) handleEnter();
            else if (keyCode === 8 || keyCode === 127) handleBackspace();
            else if (keyCode === 3) line = '';
          }
          escapeState = 'text';
          csi = '';
        }
        continue;
      }

      if (ch === '\x1b') {
        escapeState = 'esc';
      } else if (ch === '\r' || ch === '\n') {
        handleEnter();
      } else if (ch === '\x7f' || ch === '\b') {
        handleBackspace();
      } else if (ch === '\x03') {
        line = '';
      } else if (cp >= 0x20 && cp !== 0x7f) {
        line += ch;
      }
    }
  };
}

module.exports = { createToggleDetector };
