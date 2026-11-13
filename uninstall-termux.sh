#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

PREFIX="${PREFIX:-}"
if [[ "$PREFIX" != *com.termux* ]]; then
  printf 'This uninstaller is for Termux only.\n' >&2
  exit 1
fi
INSTALL_DIR="${CODEX_ZH_INSTALL_DIR:-$HOME/.local/share/codex-code-zh-cn}"
mkdir -p "$INSTALL_DIR"
INSTALL_DIR="$(cd "$INSTALL_DIR" && pwd -P)"
HOME_REAL="$(cd "$HOME" && pwd -P)"
case "$INSTALL_DIR" in
  "$HOME_REAL"/*) ;;
  *) printf 'Refusing to remove a path outside HOME: %s\n' "$INSTALL_DIR" >&2; exit 1 ;;
esac
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
remove_launcher codex-zh-language

remove_managed_prompt() {
  local name="$1"
  local target="$HOME/.codex/prompts/$name"
  local installed="$INSTALL_DIR/prompts/$name"
  if [[ -f "$target" && -f "$installed" ]] && cmp -s "$target" "$installed"; then
    rm -f "$target"
    printf 'Removed managed Codex prompt: %s\\n' "$target"
  elif [[ -f "$target" ]]; then
    printf 'Preserved modified or user-owned prompt: %s\\n' "$target"
  fi
}

remove_managed_prompt codex-zh-cn.md
remove_managed_prompt codex-zh-en.md
rmdir "$HOME/.codex/prompts" 2>/dev/null || true

rm -rf "$INSTALL_DIR"
printf 'codex-code-zh-cn Termux files removed.\n'
printf 'Original codex, ~/.codex/config.toml, user-owned prompts and ~/.codex-code-zh-cn settings were left untouched.\n'
