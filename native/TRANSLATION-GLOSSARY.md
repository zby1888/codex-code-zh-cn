# 原生 Codex 简体中文术语表（0.169.0）

本术语表是 Codex CLI、后续 Android 客户端及相关配置界面的统一简体中文基准。参考 Operit、OpenCode、RikkaHub 的产品术语和交互习惯，但不直接复制其代码、文案或品牌资产。译文必须结合 Codex 源码上下文、终端宽度和实际功能人工审校。

## 核心术语

| English | 统一简体中文 | 使用说明 |
|---|---|---|
| Agent | 智能体 | 不译为“代理” |
| Agent command center | 智能体指挥中心 | Codex 多会话任务管理界面 |
| Subagent | 子智能体 | 多智能体任务中的子任务执行者 |
| Provider | 模型服务商 | 指模型 API 提供方；服务商 ID 保留原文 |
| Model provider(s) | 模型服务商 | 统一单复数译法 |
| Model | 模型 | 模型 ID 保留原文 |
| Custom provider | 自定义模型服务商 | 设置和登录入口统一使用 |
| API key | API 密钥 | 不使用“API 键” |
| Base URL | API 基础地址 | 配置字段名保持原样 |
| Endpoint | 接口地址 | URL 值保持原样 |
| MCP server | MCP 服务 | MCP 缩写保留 |
| MCP tool | MCP 工具 | 工具名称和工具返回内容不翻译 |
| Tool | 工具 | 具体工具 ID 保留原文 |
| Tool call | 工具调用 | 描述模型调用工具的过程 |
| Tool result | 工具结果 | 工具返回内容保持原样 |
| Skill / Skills | 技能 | 功能名可写作“技能” |
| Workflow | 工作流 | 自动化步骤集合 |
| Workspace | 工作区 | Codex 工作目录及其配置上下文 |
| Session / Thread | 会话 | Codex 对话及其执行上下文统一称呼 |
| Chat | 聊天 | 仅在明确指聊天界面时使用 |
| Context | 上下文 | 不简写为“语境” |
| Context window | 上下文窗口 | 模型可用上下文容量 |
| Token | Token | LLM 用量单位保留英文 |
| Token usage | Token 用量 | 不使用“令牌用量” |
| Reasoning effort | 推理强度 | 模型推理档位统一使用 |
| Service tier | 服务档位 | 模型请求的速度/服务等级，例如 priority、flex |
| Approval | 操作审批 | 狭窄 UI 标签可简写为“审批” |
| Permission | 权限 | 权限范围或授权能力 |
| Prompt | 提示词 | 不改写用户实际输入 |
| Memory | 记忆 | 产品功能名称 |
| Streaming | 流式输出 | 逐段返回模型内容 |
| Hook / Hooks | 自动动作（生命周期钩子） | 面向用户的设置入口优先使用“自动动作”；技术说明中保留“生命周期钩子” |
| Side conversation | 旁支对话 | 与主会话并行的短对话；命令说明可写作“另外打开一个会话” |
| Composer | 输入框 | 用户编写提示词的区域 |
| Status line | 状态栏 | TUI 底部状态信息 |
| Worktree | 工作树 | Git worktree；命令和路径不翻译 |
| Sandbox | 沙盒 | elevated sandbox 译为“增强型沙盒” |
| Plan mode | 计划模式 | 命令 `/plan` 保留原样 |
| Slash command | 斜杠命令 | 命令名保留，例如 `/model` |
| TUI | TUI | 终端界面技术缩写保留 |

## 统一文案规则

1. “模型提供商”“模型提供方”“服务提供方”统一改为“模型服务商”。
2. “推理等级”“推理级别”统一改为“推理强度”。
3. “Token”保留英文；“Token usage”统一译为“Token 用量”。
4. “MCP Server”统一译为“MCP 服务”；“Tool Call”统一译为“工具调用”。
5. “Approval”完整语义为“操作审批”；为适配窄屏，按钮和短标签允许使用“审批”。
6. 同一界面中的“会话”不与“线程”混用；代码、API 字段和协议术语不受此规则影响。
7. 语句优先采用简洁、自然的简体中文，避免逐词直译和中英混排；必要的产品名、命令、协议名除外。

## 保留原文的内容

Codex、OpenAI、Operit、OpenCode、RikkaHub 等产品名；MCP、API、JSON-RPC、HTTP、HTTPS、STDIO、OAuth、TUI、PTY、Token 等技术缩写；命令名、快捷键、参数、文件名、路径、环境变量、模型 ID、服务商 ID、协议字段、JSON/RPC 字段、代码、终端命令、用户输入、模型生成内容和第三方工具输出均保持原样。

## 已人工审校的第一批斜杠命令描述

- `/model`：选择模型和推理强度
- `/presets`：运行或保存可重复使用的提示词和斜杠命令
- `/review`：检查当前更改并查找问题
- `/compact`：总结对话，避免达到上下文长度限制
- `/worktree`：在新的工作树中开始或继续对话
- `/permissions`：选择 Codex 可以执行的操作
- `/skills`：使用技能提升 Codex 执行特定任务的能力
- `/mcp`：列出 MCP 工具；使用 `/mcp verbose` 查看详细信息，或使用 `/mcp login <name>` 登录
- `/side`：另外打开一个会话
- `/diff`：看看改了啥（Git，包含未跟踪文件）
- `/hooks`：设置自动动作
