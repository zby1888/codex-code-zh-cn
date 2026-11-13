#!/data/data/com.termux/files/usr/bin/bash
# Install the Termux/Android ARM64 build without compiling native code.
set -euo pipefail

info() { printf '\033[1;36m[codex-zh-termux]\033[0m %s\n' "$*"; }
err()  { printf '\033[1;31m[codex-zh-termux]\033[0m %s\n' "$*" >&2; }

PREFIX="${PREFIX:-}"
if [[ "$PREFIX" != *com.termux* ]]; then
  err "This installer is for Termux only (PREFIX=$PREFIX)."
  exit 1
fi
ARCH="$(uname -m)"
if [[ "$ARCH" != "aarch64" && "$ARCH" != "arm64" ]]; then
  err "Android ARM64 is required; detected: $ARCH"
  exit 1
fi
for cmd in node npm tar; do
  command -v "$cmd" >/dev/null 2>&1 || { err "Missing $cmd. Run: pkg install nodejs"; exit 1; }
done
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$NODE_MAJOR" -lt 18 ]]; then
  err "Node.js 18 or newer is required; detected $(node -v)."
  exit 1
fi
command -v codex >/dev/null 2>&1 || {
  err "Codex CLI was not found. Install it first (for example: pkg install codex)."
  exit 1
}

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="${CODEX_ZH_INSTALL_DIR:-$HOME/.local/share/codex-code-zh-cn}"
BIN_DIR="$PREFIX/bin"
HOME_REAL="$(cd "$HOME" && pwd -P)"
mkdir -p "$INSTALL_DIR"
INSTALL_DIR="$(cd "$INSTALL_DIR" && pwd -P)"
case "$INSTALL_DIR" in
  "$HOME_REAL"/*) ;;
  *) err "Install directory must be inside HOME: $INSTALL_DIR"; exit 1 ;;
esac
EXPECTED_SHA256="660a3025230f6035b7b8c000e8cca6ca3992bedaa05f7b165e7c3a5f1ae8ec8a"

if [[ ! -f "$SOURCE_DIR/package.json" ]]; then
  err "package.json not found. Extract the Termux bundle first, then run install-termux.sh."
  exit 1
fi

mkdir -p "$INSTALL_DIR" "$BIN_DIR"
info "Installing app files to $INSTALL_DIR"
# Keep settings and any user data outside this source tree untouched.
tar --exclude='./.git' --exclude='./.github' --exclude='./dist' \
  -cf - -C "$SOURCE_DIR" . | tar -xf - -C "$INSTALL_DIR"

PTY_BINARY="$INSTALL_DIR/node_modules/node-pty/prebuilds/android-arm64/pty.node"
if [[ ! -f "$PTY_BINARY" ]]; then
  info "Android PTY prebuild missing; installing the published prebuilt package (no scripts, no compilation)"
  TMP_DIR="$(mktemp -d)"
  (
    cd "$TMP_DIR"
    TARBALL="$(npm pack --silent @mmmbuto/node-pty-android-arm64@1.1.2)"
    mkdir -p "$INSTALL_DIR/node_modules/node-pty"
    tar -xzf "$TMP_DIR/$TARBALL" --strip-components=1 -C "$INSTALL_DIR/node_modules/node-pty"
  )
  rm -rf "$TMP_DIR"
  PTY_BINARY="$INSTALL_DIR/node_modules/node-pty/prebuilds/android-arm64/pty.node"
fi

if [[ ! -f "$PTY_BINARY" ]]; then
  err "Android PTY binary was not installed: $PTY_BINARY"
  exit 1
fi
ACTUAL_SHA256="$(node -e "const fs=require('fs'),c=require('crypto');process.stdout.write(c.createHash('sha256').update(fs.readFileSync(process.argv[1])).digest('hex'))" "$PTY_BINARY")"
if [[ "$ACTUAL_SHA256" != "$EXPECTED_SHA256" ]]; then
  err "PTY binary checksum mismatch. Refusing to install."
  err "Expected: $EXPECTED_SHA256"
  err "Actual:   $ACTUAL_SHA256"
  exit 1
fi

info "Loading Android PTY module on this device"
node -e 'const p=require(process.argv[1]); if (typeof p.spawn !== "function") throw new Error("node-pty spawn() is unavailable")' "$INSTALL_DIR/node_modules/node-pty"

chmod +x "$INSTALL_DIR/bin/codex-zh.js" "$INSTALL_DIR/bin/codex-zh-doctor.js"

# Termux does not guarantee /usr/bin/env; use Termux's own bash and invoke Node explicitly.
for name in codex-zh codex-zh-doctor; do
  target="$BIN_DIR/$name"
  if [[ -e "$target" || -L "$target" ]] && ! grep -q "codex-code-zh-cn Termux launcher" "$target" 2>/dev/null; then
    err "Refusing to overwrite an existing command: $target"
    exit 1
  fi
done
cat > "$BIN_DIR/codex-zh" <<EOF
#!/data/data/com.termux/files/usr/bin/bash
# codex-code-zh-cn Termux launcher
exec node "$INSTALL_DIR/bin/codex-zh.js" "\$@"
EOF
cat > "$BIN_DIR/codex-zh-doctor" <<EOF
#!/data/data/com.termux/files/usr/bin/bash
# codex-code-zh-cn Termux launcher
exec node "$INSTALL_DIR/bin/codex-zh-doctor.js" "\$@"
EOF
chmod +x "$BIN_DIR/codex-zh" "$BIN_DIR/codex-zh-doctor"

info "Checking launcher"
node "$INSTALL_DIR/bin/codex-zh.js" --codex-zh-help >/dev/null
info "Installed. Original codex command and ~/.codex were not modified."
info "Run: codex-zh"
info "Switch language inside Codex: /chinese or /english"
info "Doctor: codex-zh-doctor"
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  info "Add Termux bin to PATH if needed: export PATH=\"$BIN_DIR:\$PATH\""
fi
