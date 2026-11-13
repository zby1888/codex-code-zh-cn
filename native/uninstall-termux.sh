#!/system/bin/sh
set -e

die() {
  printf '卸载失败：%s\n' "$*" >&2
  exit 1
}

PREFIX="$PREFIX"
[ -n "$PREFIX" ] || die "请在 Termux 中运行此脚本。"
[ -d "$PREFIX/bin" ] || die "未找到 Termux 的 PREFIX/bin。"

APP_ROOT="$PREFIX/libexec/codex-zh-native"
BIN_PATH="$PREFIX/bin/codex-zh-native"

[ -f "$APP_ROOT/.managed-by-codex-zh-native" ] ||
  die "未找到本安装器的所有权标记；为避免误删，已停止。"

if [ -e "$BIN_PATH" ] || [ -L "$BIN_PATH" ]; then
  [ ! -L "$BIN_PATH" ] || die "$BIN_PATH 是符号链接，不会删除它。"
  grep -Fq 'CODEX_ZH_NATIVE_LAUNCHER' "$BIN_PATH" 2>/dev/null ||
    die "$BIN_PATH 已被修改或不属于本安装器；不会删除它。"
  rm -f "$BIN_PATH"
fi

rm -rf "$APP_ROOT"

printf '已卸载 codex-zh-native。\n'
printf '原版 codex、旧版 codex-zh 和 ~/.codex 均未改动。\n'
printf '独立配置/登录目录仍保留：%s/.codex-zh-native\n' "$HOME"
printf '如确定不再需要其中的配置和登录数据，可自行删除该目录。\n'
