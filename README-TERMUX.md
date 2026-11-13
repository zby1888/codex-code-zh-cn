# Termux / Android ARM64 安装说明

本分支为 Android ARM64 / Termux 提供独立安装包。它只安装中文包装器和 Android PTY 预编译模块，不重新编译 Codex，也不覆盖原版 `codex` 命令。

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

语言切换有两种入口：

- 直接输入 `/chinese` 或 `/zh`：切换中文
- 直接输入 `/english` 或 `/en`：切换英文
- 输入 `/prompts:codex-zh-cn`：从 Codex 斜杠菜单选择中文
- 输入 `/prompts:codex-zh-en`：从 Codex 斜杠菜单选择英文

斜杠菜单入口通过 Codex 的自定义 prompt 机制实现。选中后，Codex 会把 prompt 交给模型，模型再调用 `codex-zh-language` 助手命令；按当前审批策略，Codex 可能要求你批准执行该命令。包装器会监听自己的设置文件变化，因此在 `codex-zh` 会话中命令成功执行后会实时切换翻译状态。若在原版 `codex` 中执行，则为下次启动 `codex-zh` 设置默认语言。

注意：OpenAI 当前已将 Custom Prompts 标记为弃用，推荐新项目改用 Skills；但该机制仍支持以 `/prompts:<名称>` 形式显示在斜杠菜单中。本项目使用它，是因为用户明确需要菜单候选入口。若未来 Codex 移除该机制，需迁移到当时支持的扩展方式。

安装器只在 `~/.codex/prompts/` 下添加两个独立文件：
- `codex-zh-cn.md`
- `codex-zh-en.md`

不会修改 `~/.codex/config.toml`、认证状态、provider 配置或模型配置，也不会覆盖同名的用户自定义 prompt。原版 `codex` 命令保持不变。语言偏好保存在 `~/.codex-code-zh-cn/settings.json`。

## 卸载

在包含本脚本的目录运行：

```bash
bash uninstall-termux.sh
```

卸载只移除本项目命令和安装目录；只删除未被用户修改的项目自带 prompt 文件。原版 Codex、用户自定义 prompt、`~/.codex/config.toml` 和 `~/.codex-code-zh-cn/settings.json` 均会保留。

## 0.169.0 汉化范围

翻译数据以 OpenAI Codex CLI `rust-v0.169.0` 为基线，重点覆盖 TUI 欢迎界面、内置斜杠命令说明、设置面板、权限确认、提供商配置、Agent 命令中心、侧边对话、反馈与诊断、用量统计和动态提示。模型生成的自然语言、项目自定义文本、文件内容和第三方插件输出不属于静态 UI 翻译范围。

## 云端构建与设备验收

GitHub Actions 在 Ubuntu runner 上运行单元测试、翻译数据校验，并将已发布的 Android ARM64 PTY 预编译模块封装成产物。工作流会校验预编译模块的 SHA-256；不会在 Ubuntu 上尝试加载 Android ELF 文件。

这验证的是构建包内容和依赖完整性，不等同于真实 Android 设备运行测试。首次安装后建议检查：

1. `codex-zh-doctor` 能找到 Codex。
2. `/` 菜单中能看到 `prompts:codex-zh-cn` 和 `prompts:codex-zh-en`。
3. 选择中文 prompt 后，Codex 能运行语言助手命令并切换当前界面。
4. 终端旋转/窗口尺寸变化后界面正常。
5. Ctrl+C 能正常退出。
6. 原版 `codex` 仍可独立启动。
