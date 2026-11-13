# 原生 Codex 简体中文术语表（0.169.0）

本文件是人工维护的翻译规范，不从机器翻译接口导入译文。所有新增词条必须结合源码上下文、UI 宽度和实际功能逐项审校。

| English | 简体中文 | 说明 |
|---|---|---|
| Codex | Codex | 产品名称保留 |
| TUI | TUI | 在命令和技术上下文中保留缩写 |
| slash command | 斜杠命令 | 保留命令本身，例如 `/model` |
| prompt | 提示词 | 不翻译用户实际输入的内容 |
| thread | 会话 | 表示一段 Codex 对话 |
| chat | 聊天 | 只在产品文案确实指聊天时使用 |
| context | 上下文 | context window 译为“上下文窗口” |
| token | 令牌 | token usage 译为“令牌用量” |
| model | 模型 | 模型 ID 保留原文 |
| reasoning effort | 推理强度 | 对应模型推理档位 |
| worktree | 工作树 | Git worktree 的界面说明；命令和路径不翻译 |
| agent | 智能体 | Codex agent |
| subagent | 子智能体 | 多智能体会话 |
| agent command center | 智能体指挥中心 | 作为功能入口名称 |
| skill | 技能 | Skills 功能名称在描述中译为“技能” |
| hook | 钩子 | lifecycle hook 译为“生命周期钩子” |
| provider | 提供方 | model provider 译为“模型提供方” |
| MCP | MCP | 协议缩写保留 |
| plugin | 插件 | 不翻译插件自身输出 |
| side conversation | 旁支对话 | 与主会话并行的短对话 |
| composer | 输入框 | 用户编写提示词的区域 |
| status line | 状态栏 | TUI 底部状态信息 |
| terminal pet | 终端宠物 | 装饰性终端角色 |
| raw scrollback | 原始滚屏 | 保留终端原始滚动内容 |
| approval | 审批 | 权限确认和操作批准 |
| sandbox | 沙盒 | elevated sandbox 译为“增强型沙盒” |
| plan mode | 计划模式 | 不翻译命令 `/plan` |
| Markdown | Markdown | 格式名称保留 |
| ZIP | ZIP 文件 | 文件格式保留 |

## 已人工审校的第一批斜杠命令描述

- `/model`：选择模型和推理强度
- `/presets`：运行或保存可重复使用的提示词和斜杠命令
- `/review`：检查当前更改并查找问题
- `/compact`：总结对话，避免达到上下文长度限制
- `/worktree`：在新的工作树中开始或继续对话
- `/permissions`：选择 Codex 可以执行的操作
- `/skills`：使用技能提升 Codex 执行特定任务的能力
- `/mcp`：列出 MCP 工具；使用 `/mcp verbose` 查看详细信息，或使用 `/mcp login <name>` 登录

## 不翻译的内容

命令名、快捷键、参数、文件名、路径、环境变量、模型 ID、provider ID、协议字段、JSON/RPC 字段、代码、终端命令、用户输入、模型生成内容和第三方工具输出均保持原样。
