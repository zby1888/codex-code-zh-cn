#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

PREFIX="\${PREFIX:-}"
INSTALL_DIR="\${CODEX_ZH_INSTALL_DIR:-$HOME/.local/share/codex-code-zh-cn}"
BIN_DIR="$PREFIX/bin"

remove_link() {
  local name="$1"
  local target="$BIN_DIR/$name"
  if [[ -L "$target" ]]; then
    local resolved
    resolved="$(readlink -f "$target" 2>/dev/null || true)"
    case "$resolved" in
      "$INSTALL_DIR"/bin/"$name".js) rm -f "$target" ;;
    esac
  fi
}

remove_link codex-zh
remove_link codex-zh-doctor
rm -rf "$INSTALL_DIR"
printf 'codex-code-zh-cn Termux files removed.\n'
printf 'Original codex, ~/.codex and ~/.codex-code-zh-cn settings were left untouched.\n'
