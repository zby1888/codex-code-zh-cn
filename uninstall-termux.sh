#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

PREFIX="${PREFIX:-}"
INSTALL_DIR="${CODEX_ZH_INSTALL_DIR:-$HOME/.local/share/codex-code-zh-cn}"
BIN_DIR="$PREFIX/bin"

remove_launcher() {
  local name="$1"
  local target="$BIN_DIR/$name"
  if [[ -f "$target" ]] && grep -q "codex-code-zh-cn Termux launcher" "$target"; then
    rm -f "$target"
  fi
}

remove_launcher codex-zh
remove_launcher codex-zh-doctor
rm -rf "$INSTALL_DIR"
printf 'codex-code-zh-cn Termux files removed.\n'
printf 'Original codex, ~/.codex and ~/.codex-code-zh-cn settings were left untouched.\n'
