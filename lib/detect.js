'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * detect.js — locate the Codex CLI executable and report its version.
 *
 * Modern Codex is installed as an npm package whose codex shim forwards to
 * a native per-platform binary:
 *
 *   node_modules/@openai/codex/bin/codex.js
 *     └─▶ node_modules/@openai/codex/node_modules/@openai/codex-<target>
 *           └─▶ vendor/<target-triple>/bin/codex[.exe]
 */

function which(command) {
  if (!command) return null;
  if (process.platform === 'win32') {
    const res = spawnSync('where.exe', [command], { encoding: 'utf8', windowsHide: true });
    if (res.status === 0) return res.stdout.split(/\r?\n/).find(Boolean) || null;
    return null;
  }

  // Do not depend on the external which utility: minimal Android/Termux
  // installations may not have it in PATH.
  const hasPath = command.includes(path.sep) || (path.sep !== '/' && command.includes('/'));
  const candidates = hasPath
    ? [path.resolve(command)]
    : (process.env.PATH || '')
        .split(path.delimiter)
        .filter(Boolean)
        .map((dir) => path.join(dir, command));

  for (const candidate of candidates) {
    if (isFileExecutable(candidate)) return candidate;
  }
  return null;
}

function isFileExecutable(file) {
  try {
    const mode = process.platform === 'win32' ? fs.constants.R_OK : fs.constants.X_OK;
    fs.accessSync(file, mode);
    return fs.statSync(file).isFile();
  } catch {
    return false;
  }
}

const SHIM_MARKER = 'codex-code-zh-cn shadow shim';

function isShadowShim(file) {
  try {
    return fs.readFileSync(file, 'utf8').slice(0, 512).includes(SHIM_MARKER);
  } catch {
    return false;
  }
}

function shadowState() {
  const home = process.env.CODEX_ZH_HOME || path.join(os.homedir(), '.codex-code-zh-cn');
  try {
    return JSON.parse(fs.readFileSync(path.join(home, 'shadow-state.json'), 'utf8'));
  } catch {
    return null;
  }
}

function resolveCodexBin(override) {
  if (override) return path.resolve(override);
  const fromEnv = process.env.CODEX_BIN;
  if (fromEnv) return path.resolve(fromEnv);
  const realEnv = process.env.CODEX_ZH_REAL_BIN;
  if (realEnv) return path.resolve(realEnv);
  const found = which('codex');
  if (found && isFileExecutable(found)) {
    // 当前 PATH 里的 codex 可能已经被我们接管成 shim；
    // 此时包装器要用保存下来的真实入口，避免递归/二次翻译。
    if (isShadowShim(found)) {
      const state = shadowState();
      if (state && state.realTarget && isFileExecutable(state.realTarget)) {
        return state.realTarget;
      }
      return null;
    }
    return found;
  }
  return null;
}

/**
 * Try to locate the native platform binary (for doctor output and future
 * in-place patching). Returns null when Codex is installed differently.
 */
function resolveNativeBinary(binOverride) {
  const bin = binOverride || resolveCodexBin();
  if (!bin) return null;
  let real = bin;
  try {
    real = fs.realpathSync(bin);
  } catch {}
  const dir = path.dirname(real);
  // npm shim layouts:
  //   Unix: <pkg-root>/bin/codex.js
  //   Win:  <npm-prefix>/codex.cmd with node_modules alongside
  const pkgRoot = path.resolve(dir, '..');
  const targetDirs = [
    path.join(pkgRoot, 'node_modules', '@openai'),
    path.join(dir, 'node_modules', '@openai'),
    path.join(path.dirname(dir), 'node_modules', '@openai'),
  ];
  for (const base of targetDirs) {
    let names = [];
    try {
      names = fs.readdirSync(base).filter((n) => n.startsWith('codex-'));
    } catch {}
    for (const name of names) {
      const target = process.platform === 'win32' ? 'win32' : process.platform === 'darwin' ? 'darwin' : 'linux';
      if (!name.includes(target)) continue;
      const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
      if (!name.includes(arch)) continue;
      const vendor = path.join(base, name, 'vendor');
      let candidates = [];
      try {
        const triples = fs.readdirSync(vendor);
        for (const triple of triples) {
          candidates.push(
            path.join(vendor, triple, 'bin', process.platform === 'win32' ? 'codex.exe' : 'codex')
          );
        }
      } catch {}
      for (const c of candidates) {
        if (isFileExecutable(c)) return c;
      }
    }
  }
  return null;
}

function getCodexVersion(codexBin) {
  const bin = codexBin || resolveCodexBin();
  if (!bin) return null;
  try {
    const res = spawnSync(bin, ['--version'], {
      encoding: 'utf8',
      env: { ...process.env, TERM: 'dumb' },
      timeout: 15000,
      windowsHide: true,
    });
    const out = (res.stdout || '') + (res.stderr || '');
    const trimmed = out.trim();
    const m = trimmed.match(/(?:codex-cli[^\d]*)?(\d+\.\d+\.\d+(?:[-.][0-9A-Za-z.-]+)?)/);
    return m ? m[1] : trimmed.slice(0, 80) || null;
  } catch {
    return null;
  }
}

module.exports = { which, resolveCodexBin, resolveNativeBinary, getCodexVersion, isShadowShim };
