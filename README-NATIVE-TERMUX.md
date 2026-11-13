# 原生简体中文 Codex（Termux / Android ARM64）

本路线将中文直接写入 Codex Rust TUI 源码并重新编译，不再通过 PTY 运行时翻译终端输出。

## 固定基线

- 上游项目：`openai/codex`
- 上游版本：`rust-v0.169.0`
- Android 目标：`aarch64-linux-android`
- Termux 打包基线：`termux/termux-packages` 中的 Codex 0.169.0 构建脚本
- 云端环境：GitHub Actions + Termux 官方 package-builder Docker 镜像

Termux 官方 0.169.0 构建脚本会处理 Rust 工具链、Android NDK、`rusty_v8` 和 Android 链接细节。不要把普通 Ubuntu 的 `cargo build` 当成 Android 构建，也不要在用户手机上编译。

## 分阶段实施

1. **原版基线构建**：先不修改任何英文文本，验证官方 0.169.0 源码能在 GitHub Actions 上构建为 Android ARM64 ELF。
2. **原生翻译补丁**：逐模块修改 TUI 静态文本；每条译文由人工校对，统一术语，不把机器翻译直接合入。
3. **回归检查**：检查 Rust 格式、相关 crate 测试、翻译覆盖率、命令名/参数/路径/模型 ID 不被误翻译。
4. **并行安装包**：把新二进制安装到独立目录并提供 `codex-zh-native` 启动命令，不覆盖原版 `codex`、现有 `codex-zh`、`~/.codex` 或认证配置。
5. **真机验收**：检查 TUI 渲染、中文宽度、弹窗、菜单、终端尺寸变化、Ctrl+C、登录和 code-mode helper。

## 翻译边界

- 翻译 Codex 自带的静态 TUI 文案、帮助说明、菜单标题、设置项、确认提示和错误提示。
- 保留斜杠命令、快捷键、命令参数、文件路径、环境变量、协议字段、代码片段、模型 ID 和 provider ID。
- 不翻译模型生成的对话内容、项目自己的文件内容或第三方插件输出。
- 中文采用简体中文技术产品文案；同一术语在整个 TUI 中保持一致。
- 不为了追求覆盖率而猜测动态字符串含义；动态格式串必须保留占位符并补测试。

## 当前状态

当前分支首先执行原版基线构建。基线产物只用于验证编译链路，不是最终汉化版，也不应直接覆盖设备上的 Codex。只有在构建链路确认成功后，才开始提交原生中文补丁。
