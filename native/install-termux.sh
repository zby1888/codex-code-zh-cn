#!/system/bin/sh
set -e

die() {
  printf '安装失败：%s\n' "$*" >&2
  exit 1
}

PREFIX="$PREFIX"
[ -n "$PREFIX" ] || die "请在 Termux 中运行此脚本，不要通过 su/root 执行。"
[ -d "$PREFIX/bin" ] || die "未找到 Termux 的 PREFIX/bin。"
[ -x "$PREFIX/bin/pkg" ] || die "未检测到 Termux 包管理器。"

ARCH="$(uname -m 2>/dev/null || true)"
case "$ARCH" in
  aarch64|arm64) ;;
  *) die "此安装包仅支持 Android ARM64（aarch64）；当前架构：$ARCH" ;;
esac

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
for file in codex codex-code-mode-host SHA256SUMS BUILD-METADATA.txt uninstall-termux.sh; do
  [ -f "$SCRIPT_DIR/$file" ] || die "安装包缺少文件：$file"
done

command -v sha256sum >/dev/null 2>&1 || die "缺少 sha256sum。请先执行：pkg install coreutils"
(cd "$SCRIPT_DIR" && sha256sum -c SHA256SUMS) || die "校验失败，文件可能损坏或被修改。"

missing=""
command -v git >/dev/null 2>&1 || missing="$missing git"
[ -e "$PREFIX/lib/libc++_shared.so" ] || missing="$missing libc++"
[ -e "$PREFIX/lib/libssl.so" ] || missing="$missing openssl"
[ -e "$PREFIX/lib/libcrypto.so" ] || missing="$missing openssl"
if [ -n "$missing" ]; then
  printf '缺少运行依赖：%s\n' "$missing" >&2
  die "请先执行：pkg install git libc++ openssl"
fi

VERSION="$(sed -n 's/^Install version: //p' "$SCRIPT_DIR/BUILD-METADATA.txt" | head -n 1)"
case "$VERSION" in
  0.169.0-zh-[0-9a-f]*) ;;
  *) die "构建元数据中的安装版本无效：$VERSION" ;;
esac

APP_ROOT="$PREFIX/libexec/codex-zh-native"
RELEASES="$APP_ROOT/releases"
BIN_PATH="$PREFIX/bin/codex-zh-native"

if [ -e "$APP_ROOT" ] && [ ! -f "$APP_ROOT/.managed-by-codex-zh-native" ]; then
  die "$APP_ROOT 已存在但不属于本安装器；为避免覆盖文件，已停止。"
fi

if [ -e "$BIN_PATH" ] || [ -L "$BIN_PATH" ]; then
  [ ! -L "$BIN_PATH" ] || die "$BIN_PATH 是符号链接，不会覆盖它。"
  grep -Fq 'CODEX_ZH_NATIVE_LAUNCHER' "$BIN_PATH" 2>/dev/null ||
    die "$BIN_PATH 已存在且不是本安装器创建的命令；不会覆盖它。"
fi

mkdir -p "$RELEASES"
printf '%s\n' 'managed by codex-zh-native installer' > "$APP_ROOT/.managed-by-codex-zh-native"
STAGE="$RELEASES/.stage-$VERSION-$"
trap 'rm -rf "$STAGE"' 0 HUP INT TERM
rm -rf "$STAGE"
mkdir -p "$STAGE"
cp "$SCRIPT_DIR/codex" "$SCRIPT_DIR/codex-code-mode-host" "$SCRIPT_DIR/BUILD-METADATA.txt" "$STAGE/"
chmod 700 "$STAGE/codex" "$STAGE/codex-code-mode-host"

RELEASE_DIR="$RELEASES/$VERSION"
rm -rf "$RELEASE_DIR"
mv "$STAGE" "$RELEASE_DIR"

WRAPPER_TMP="$PREFIX/bin/.codex-zh-native.$$"
cat > "$WRAPPER_TMP" <<EOF
#!/system/bin/sh
# CODEX_ZH_NATIVE_LAUNCHER
set -e
PREFIX="\$PREFIX"
if [ -z "\$PREFIX" ]; then
  PREFIX="/data/data/com.termux/files/usr"
fi
APP_DIR="\$PREFIX/libexec/codex-zh-native/releases/$VERSION"
if [ ! -x "\$APP_DIR/codex" ]; then
  echo "codex-zh-native: 找不到主程序，请重新运行安装器。" >&2
  exit 127
fi
if [ -z "\$CODEX_HOME" ]; then
  if [ -z "\$HOME" ]; then
    echo "codex-zh-native: HOME 未设置。" >&2
    exit 1
  fi
  CODEX_HOME="\$HOME/.codex-zh-native"
fi
if [ ! -d "\$CODEX_HOME" ]; then
  mkdir -p "\$CODEX_HOME" || {
    echo "codex-zh-native: 无法创建 CODEX_HOME：\$CODEX_HOME" >&2
    exit 1
  }
fi
export CODEX_HOME
exec "\$APP_DIR/codex" "\$@"
EOF
chmod 700 "$WRAPPER_TMP"
mv -f "$WRAPPER_TMP" "$BIN_PATH"

# Remove older releases only after the new launcher is in place.
find "$RELEASES" -mindepth 1 -maxdepth 1 -type d ! -name "$VERSION" -exec rm -rf {} \;

printf '\n安装成功。\n'
printf '启动命令：codex-zh-native\n'
printf '独立配置目录：%s/.codex-zh-native\n' "$HOME"
printf '原版 codex、旧版 codex-zh 和 ~/.codex 均未被安装器覆盖。\n'
printf '卸载：在本目录运行 sh uninstall-termux.sh\n'
