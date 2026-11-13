# Codex 原生简体中文（Termux ARM64）

## 适用范围

- Android + Termux
- ARM64 / aarch64
- Codex CLI 0.169.0，基于 OpenAI 上游 `rust-v0.169.0`
- 不需要 Root；请在普通 Termux shell 中安装和运行
- 需要 Termux 运行依赖：`git`、`libc++`、`openssl`

## 安装

如果 ZIP 在 Android 的 Download 目录，首次访问共享存储时先执行 `termux-setup-storage` 并授予权限。然后在 Termux 执行：

```sh
pkg update
pkg install unzip coreutils git libc++ openssl
```

将 GitHub Actions 下载的 ZIP 放到 Termux 可访问的位置，解压后进入解压目录。例如：

```sh
mkdir -p ~/tmp/codex-zh-native
cd ~/tmp/codex-zh-native
unzip -o /sdcard/Download/codex-native-termux-aarch64-zh.zip
sh install-termux.sh
```

如果 ZIP 文件名或下载目录不同，请相应修改 `unzip` 命令。

## 启动与数据隔离

```sh
codex-zh-native --version
codex-zh-native
```

默认使用独立配置目录：

```text
~/.codex-zh-native
```

首次启动时启动器会自动创建这个独立目录，你需要在其中单独登录。安装器不会复制、覆盖或删除原版 `~/.codex`，也不会替换：

- `codex`
- `codex-zh`

如果你明确希望手动指定其他配置目录，可以在启动前设置 `CODEX_HOME`：

```sh
CODEX_HOME="$HOME/.codex-zh-native" codex-zh-native
```

## 卸载

在解压后的安装包目录执行：

```sh
sh uninstall-termux.sh
```

卸载器只删除它创建的 `codex-zh-native` 命令和 `$PREFIX/libexec/codex-zh-native` 程序文件。为了避免误删个人数据，**不会自动删除** `~/.codex-zh-native`。确认不再需要其中的登录和配置后，可自行删除。

## 安全与限制

- 不要通过 `su` 或 `sudo` 运行安装器。
- 安装器会校验 ZIP 中的二进制、安装脚本和构建元数据 SHA256。
- 如果 `codex-zh-native` 已存在且不是本安装器创建的命令，安装器会停止，不会覆盖它。
- 程序目录位于 Termux 私有 `$PREFIX/libexec`，不修改系统 `/usr/bin`。
- 当前版本只汉化已纳入源码补丁的界面；尚未覆盖的界面仍可能显示英文。
- 此构建目标最低 Android API 为 24（Android 7.0），实际运行仍取决于设备和 Termux 环境。

## 构建信息

检查同目录的 `BUILD-METADATA.txt` 与 `SHA256SUMS`。本安装包会在构建阶段检查关键简体中文字符串确实存在于主程序二进制中。
