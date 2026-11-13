# Termux / Android ARM64 安装说明

本分支为 Android ARM64 / Termux 提供独立安装包。它只安装中文包装器和 Android PTY 预编译模块，不重新编译 Codex，也不覆盖系统原版 `codex` 命令。

## 适用条件

- Android 64 位设备（`aarch64` / `arm64`）
- Termux
- Node.js 18 或更高版本
- 已经能在 Termux 里运行原版 `codex`
- 不需要 Root 权限

## 下载云端构建包

1. 打开本仓库的 [Termux Android ARM64 Actions](https://github.com/zby1888/codex-code-zh-cn/actions/workflows/termux-aarch64.yml)。
2. 选择最新一次成功的 **Termux Android ARM64 bundle** 运行记录。
3. 在页面底部的 Artifacts 下载 `codex-code-zh-cn-termux-aarch64`。
4. 将下载的 ZIP 解压到 Termux 可访问的目录。

如果从 Android 浏览器下载到系统 Download 目录，先在 Termux 执行一次 `termux-setup-storage`，然后例如：

```bash
pkg install -y unzip
mkdir -p ~/tmp/codex-zh
cd ~/tmp/codex-zh
unzip ~/storage/downloads/codex-code-zh-cn-termux-aarch64.zip
```

解压后，进入包含 `install-termux.sh` 和 `package.json` 的目录，再执行：

```bash
bash install-termux.sh
```

安装脚本会验证 Android PTY 文件的 SHA-256，并将命令安装到 `$PREFIX/bin`。

## 使用

```bash
codex-zh
codex-zh-doctor
```

在 Codex 输入框内：

- `/chinese` 或 `/zh`：切换中文
- `/english` 或 `/en`：切换英文

注意：`/chinese`、`/zh`、`/english` 和 `/en` 是包装器在终端输入流中识别的快捷命令，不是 Codex 内置斜杠命令，因此不会出现在 Codex 自带的斜杠候选菜单中。请完整输入命令并按回车。包装器不向 `~/.codex/prompts` 写入自定义提示文件，以免改动你的 Codex 用户配置。

原版 `codex` 命令保持不变。包装器不修改 `~/.codex`、认证状态、provider 配置或模型配置。语言偏好仍由项目保存在 `~/.codex-code-zh-cn/settings.json`。

## 卸载

在包含本脚本的目录运行：

```bash
bash uninstall-termux.sh
```

卸载只移除本包装器的命令链接和安装目录，不会删除原版 Codex 或用户设置。

## 云端构建与设备验收

GitHub Actions 在 Ubuntu runner 上运行单元测试、翻译数据校验，并将已发布的 Android ARM64 PTY 预编译模块封装成产物。工作流会校验预编译模块的 SHA-256；不会在 Ubuntu 上尝试加载 Android ELF 文件。

这验证的是构建包内容和依赖完整性，不等同于真实 Android 设备运行测试。首次安装后建议检查：

1. `codex-zh-doctor` 能找到 Codex。
2. `codex-zh` 能进入交互界面。
3. 终端旋转/窗口尺寸变化后界面正常。
4. Ctrl+C 能正常退出。
5. 原版 `codex` 仍可独立启动。
